import { Client, GatewayIntentBits, Events } from 'discord.js';
import { addExpense, getExpenses, getUserBudget, updateUserBudget } from './database.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = '!';

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Helper to download image
const downloadImage = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to download image');

        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        // Extract extension or default to .jpg
        const contentType = response.headers.get('content-type');
        let ext = '.jpg';
        if (contentType.includes('png')) ext = '.png';
        if (contentType.includes('webp')) ext = '.webp';
        if (contentType.includes('jpeg')) ext = '.jpg';

        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Write stream
        const fileStream = fs.createWriteStream(filepath);

        // Node 18+ fetch returns a stream in body
        // We use pipeline for cleaner async/await stream handling
        await pipeline(Readable.fromWeb(response.body), fileStream);

        return `/uploads/${filename}`;
    } catch (error) {
        console.error("Error downloading image:", error);
        return null;
    }
};

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // !log <amount> <category> [description]
    if (command === 'log' || command === 'add') {
        let amountRaw = args[0];

        // Handle "1.000.000" (IDR format) -> "1000000"
        // Remove dots, replace comma with dot for decimals if needed (though usually IDR doesn't use decimals)
        if (amountRaw && amountRaw.includes('.')) {
            // Check if it's a thousand separator (multiple dots or dot followed by 3 digits)
            // Simple heuristic: remove all dots
            amountRaw = amountRaw.replace(/\./g, '');
        }

        const amount = parseFloat(amountRaw);
        const category = args[1];
        const title = args.slice(2).join(' ') || 'Discord Expense';

        if (isNaN(amount) || !category) {
            return message.reply('Usage: `!log <amount> <category> [description]` (attach image for receipt)\nExample: `!log 100000 Food Lunch`');
        }

        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

        // Handle Attachment
        let receiptUrl = null;
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            if (attachment.contentType.startsWith('image/')) {
                message.channel.send('📥 Downloading receipt...');
                receiptUrl = await downloadImage(attachment.url);
            }
        }

        try {
            await addExpense({
                amount,
                category: formattedCategory,
                title,
                date: new Date().toISOString(),
                userId: message.author.id,
                username: message.author.username,
                receiptUrl
            });

            let replyMsg = `✅ Expense recorded: **${amount.toLocaleString('id-ID')}** for *${formattedCategory}* (${title})`;
            if (receiptUrl) replyMsg += `\n📎 Receipt attached.`;

            message.reply(replyMsg);
        } catch (e) {
            console.error(e);
            message.reply('❌ Failed to save expense.');
        }
    }

    // !budget <amount>
    if (command === 'budget') {
        const amount = parseFloat(args[0]);
        if (isNaN(amount)) return message.reply('Usage: `!budget <amount>` (e.g., `!budget 500`)');

        await updateUserBudget(message.author.id, message.author.username, amount);
        message.reply(`✅ Your monthly budget has been set to **$${amount}**.`);
    }

    // !status OR !spending
    if (command === 'status' || command === 'spending') {
        const expenses = await getExpenses();
        const userBudget = await getUserBudget(message.author.id); // Get Personal Budget

        // Calculate Personal Stats
        const userExpenses = expenses.filter(e => e.userId === message.author.id);
        const totalSpent = userExpenses.reduce((acc, curr) => acc + curr.amount, 0);
        const remaining = userBudget - totalSpent;
        const percentage = Math.min((totalSpent / userBudget) * 100, 100);

        const barLength = 20;
        const filled = Math.round((percentage / 100) * barLength);
        const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

        // Budget Warning
        let warning = '';
        if (percentage >= 100) {
            warning = '\n\n🚨 **ALERT:** You have exceeded your budget!';
        } else if (percentage >= 80) {
            warning = '\n\n⚠️ **Warning:** You have used over 80% of your budget.';
        }

        message.reply(`
**👤 Personal Monthly Overview**
**Budget:** $${userBudget}
**Spent:** $${totalSpent.toFixed(2)}
**Remaining:** $${remaining.toFixed(2)}

\`${bar}\` ${percentage.toFixed(1)}%${warning}
    `);
    }

    // !leaderboard
    if (command === 'leaderboard' || command === 'top') {
        const expenses = await getExpenses();
        const totals = {};

        expenses.forEach(exp => {
            const name = exp.username || 'Unknown';
            if (!totals[name]) totals[name] = 0;
            totals[name] += exp.amount;
        });

        const sorted = Object.entries(totals)
            .sort(([, a], [, b]) => b - a)
            .map(([name, amount], index) => `${index + 1}. **${name}**: $${amount.toFixed(2)}`)
            .join('\n');

        message.reply(`**🏆 Spending Leaderboard**\n${sorted || 'No expenses yet.'}`);
    }

    // !help
    if (command === 'help') {
        message.reply(`
**🤖 Monthly Expense Bot Commands**

**📝 LOGGING EXPENSES**
• \`!log <amount> <category> [note]\`
  Example: \`!log 50.000 Food Nasi Goreng\`
  *💡 Tip: Attach an image to the message to save it as a receipt!*
  *💡 Tip: You can use dots for thousands (e.g., 1.000.000)*

**📊 YOUR STATS**
• \`!status\` - See your budget progress bar and remaining balance
• \`!budget <amount>\` - Set your personal monthly budget
  Example: \`!budget 5.000.000\`

**🏆 GROUP**
• \`!leaderboard\` - See top spenders this month

**🏷️ CATEGORIES**
Food, Shopping, Housing, Transport, Utilities, Entertainment, Other
`);
    }
});


export const sendDM = async (userId, message) => {
    try {
        const user = await client.users.fetch(userId);
        if (user) {
            await user.send(message);
            console.log(`Sent DM to ${user.tag}: ${message}`);
            return true;
        }
    } catch (error) {
        console.error(`Failed to send DM to ${userId}:`, error);
        return false;
    }
};

export const startBot = () => {
    if (!process.env.DISCORD_TOKEN) {
        console.warn("⚠️ DISCORD_TOKEN is missing in .env file. Bot will not start.");
        return;
    }
    client.login(process.env.DISCORD_TOKEN);
};
