import { Client, GatewayIntentBits, Events } from 'discord.js';
import { addExpense, getExpenses, getUserBudget, updateUserBudget, addRecurringExpense, getRecurringExpenses } from './database.js';
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

    // !recent
    if (command === 'recent' || command === 'history') {
        const expenses = await getExpenses();
        const userExpenses = expenses
            .filter(e => e.userId === message.author.id)
            .slice(0, 5); // Take last 5 (ordered desc in DB)

        if (userExpenses.length === 0) return message.reply('No recent expenses found.');

        const list = userExpenses.map((e, i) => {
            const date = new Date(e.date).toLocaleDateString();
            return `${i + 1}. **${e.amount.toLocaleString('id-ID')}** - ${e.title} (${e.category}) [${date}]`;
        }).join('\n');

        message.reply(`**🕒 Recent Activity**\n${list}`);
    }

    // !recurring
    if (command === 'recurring') {
        const subCmd = args[0];

        if (!subCmd || subCmd === 'list') {
            const allRecurring = await getRecurringExpenses();
            const userRecurring = allRecurring.filter(r => r.userId === message.author.id);

            if (userRecurring.length === 0) return message.reply('You have no recurring expenses set.');

            const list = userRecurring.map(r => {
                return `• **${r.title}**: ${r.amount.toLocaleString('id-ID')} (Day ${r.dayOfMonth})`;
            }).join('\n');

            return message.reply(`**🔄 Your Recurring Expenses**\n${list}`);
        }

        if (subCmd === 'add') {
            // !recurring add <amount> <day> <category> <title>
            // Example: !recurring add 50000 1 Food Monthly Rice
            const amountRaw = args[1];
            const day = parseInt(args[2]);
            const category = args[3];
            const title = args.slice(4).join(' ');

            if (!amountRaw || isNaN(day) || !category || !title) {
                return message.reply('Usage: `!recurring add <amount> <day_of_month> <category> <title>`\nExample: `!recurring add 100000 1 Housing Internet Bill`');
            }

            let amount = parseFloat(amountRaw.replace(/\./g, ''));
            if (isNaN(amount)) return message.reply('Invalid amount.');

            const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

            // Store in DB
            await addRecurringExpense({
                amount,
                dayOfMonth: day,
                category: formattedCategory,
                title,
                userId: message.author.id,
                username: message.author.username
            });

            message.reply(`✅ Added recurring expense: **${title}** (${formattedCategory}) - ${amount.toLocaleString('id-ID')} on day ${day} of every month.`);
        }
    }

    // !categories
    if (command === 'categories') {
        message.reply('**📂 Valid Categories:**\nFood, Shopping, Housing, Transport, Utilities, Entertainment, Other');
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
**Budget:** $${userBudget.toLocaleString('id-ID')}
**Spent:** $${totalSpent.toLocaleString('id-ID')}
**Remaining:** $${remaining.toLocaleString('id-ID')}

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
            .map(([name, amount], index) => `${index + 1}. **${name}**: $${amount.toLocaleString('id-ID')}`)
            .join('\n');

        message.reply(`**🏆 Spending Leaderboard**\n${sorted || 'No expenses yet.'}`);
    }

    // !help
    if (command === 'help') {
        message.reply(`
**🤖 Etoile Bot Commands**

**📝 LOGGING & MANAGING**
• \`!log <amount> <category> [note]\` - Add expense (attach receipt!)
• \`!recent\` - View last 5 expenses
• \`!budget <amount>\` - Set monthly limit
• \`!categories\` - List categories

**🔄 RECURRING**
• \`!recurring list\` - View automated bills
• \`!recurring add <amount> <day> <category> <title>\`
  Example: \`!recurring add 150000 1 Utilities Internet\`

**📊 STATS**
• \`!status\` - Check budget progress
• \`!leaderboard\` - Top spenders

*💡 Note: Use dots for thousands (1.000.000)*
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
