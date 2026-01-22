import React, { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useSettings } from '../../contexts/SettingsContext';

const AppTour = () => {
    const { theme } = useSettings();
    const isDarkMode = theme === 'dark';
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Check if user has seen the tour
        const hasSeenTour = localStorage.getItem('hasSeenTour_v1');
        if (!hasSeenTour) {
            setRun(true);
        }
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status, type } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('hasSeenTour_v1', 'true');
        }
    };

    const steps = [
        {
            target: 'body',
            content: (
                <div>
                    <h3 className="font-bold text-lg mb-2">Welcome to SpendSync! 👋</h3>
                    <p>Let's take a quick tour to help you get started with tracking your expenses.</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="add-expense-btn"]', // We need to add this attribute to the button
            content: 'Click here to add a new expense. You can enter details and even upload a receipt!',
        },
        {
            target: '[data-tour="dashboard-stats"]', // Add to stats container
            content: 'See your total spending, budget status, and remaining balance at a glance.',
        },
        {
            target: '[data-tour="manage-budget-link"]', // Add to nav link
            content: 'Go here to set your monthly budget limits.',
        },
        {
            target: '[data-tour="recurring-link"]', // Add to nav link
            content: 'Manage your recurring bills like rent or subscriptions here.',
        },
        {
            target: '[data-tour="filters"]', // Add to filter section
            content: 'Use these filters to search expenses or view specific date ranges.',
        }
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: isDarkMode ? '#1f2937' : '#fff',
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                    primaryColor: '#8b5cf6', // Violet-500
                    textColor: isDarkMode ? '#fff' : '#333',
                    zIndex: 1000,
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#8b5cf6',
                },
                buttonBack: {
                    color: isDarkMode ? '#fff' : '#333',
                }
            }}
        />
    );
};

export default AppTour;
