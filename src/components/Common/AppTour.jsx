import React, { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useSettings } from '../../contexts/SettingsContext';

const AppTour = () => {
    const { theme, t } = useSettings();
    const isDarkMode = theme === 'dark';
    const [run, setRun] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check screen size
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Check if user has seen the tour
        const hasSeenTour = localStorage.getItem('hasSeenTour_v1');
        if (!hasSeenTour) {
            // Small delay to let the page render first
            setTimeout(() => setRun(true), 500);
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

    // Mobile-optimized steps (skip sidebar items on mobile since they're hidden)
    const steps = [
        {
            target: 'body',
            content: (
                <div className="text-sm">
                    <h3 className="font-bold text-base mb-2">Welcome to SpendSync! 👋</h3>
                    <p>Let's take a quick tour to help you get started.</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="add-expense-btn"]',
            content: (
                <div className="text-sm">
                    <p>➕ Tap here to add a new expense!</p>
                </div>
            ),
            placement: isMobile ? 'top' : 'left',
            disableScrolling: isMobile,
        },
        {
            target: '[data-tour="dashboard-stats"]',
            content: (
                <div className="text-sm">
                    <p>📊 Your spending summary at a glance.</p>
                </div>
            ),
            placement: 'bottom',
        },
        // Only show sidebar items on desktop
        ...(!isMobile ? [
            {
                target: '[data-tour="manage-budget-link"]',
                content: (
                    <div className="text-sm">
                        <p>💰 Set your monthly budget limits here.</p>
                    </div>
                ),
                placement: 'right',
            },
            {
                target: '[data-tour="recurring-link"]',
                content: (
                    <div className="text-sm">
                        <p>🔄 Manage recurring bills like rent or subscriptions.</p>
                    </div>
                ),
                placement: 'right',
            },
        ] : []),
        {
            target: '[data-tour="filters"]',
            content: (
                <div className="text-sm">
                    <p>🔍 Search and filter your expenses.</p>
                    <p className="text-xs opacity-70 mt-1">That's it! You're ready to go.</p>
                </div>
            ),
            placement: isMobile ? 'bottom' : 'bottom',
        }
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            scrollToFirstStep
            disableScrollParentFix={isMobile}
            callback={handleJoyrideCallback}
            floaterProps={{
                disableAnimation: isMobile,
            }}
            styles={{
                options: {
                    arrowColor: isDarkMode ? '#1f2937' : '#fff',
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    overlayColor: 'rgba(0, 0, 0, 0.6)',
                    primaryColor: '#8b5cf6',
                    textColor: isDarkMode ? '#fff' : '#333',
                    zIndex: 10000,
                    width: isMobile ? 280 : 340,
                },
                tooltip: {
                    padding: isMobile ? '12px 16px' : '16px 20px',
                    borderRadius: '16px',
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#8b5cf6',
                    borderRadius: '10px',
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    fontSize: isMobile ? '13px' : '14px',
                },
                buttonBack: {
                    color: isDarkMode ? '#fff' : '#333',
                    marginRight: '8px',
                    fontSize: isMobile ? '13px' : '14px',
                },
                buttonSkip: {
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    fontSize: isMobile ? '12px' : '13px',
                },
                spotlight: {
                    borderRadius: '12px',
                },
            }}
            locale={{
                back: 'Back',
                close: 'Close',
                last: 'Done!',
                next: 'Next',
                skip: 'Skip',
            }}
        />
    );
};

export default AppTour;
