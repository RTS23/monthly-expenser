import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useSettings } from '../../contexts/SettingsContext';
// Onboarding tour component - mobile optimized

const AppTour = () => {
    const { theme, t } = useSettings();
    const isDarkMode = theme === 'dark';
    const [run, setRun] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour_v1');
        if (!hasSeenTour) {
            setTimeout(() => setRun(true), 800);
        }
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRun(false);
            localStorage.setItem('hasSeenTour_v1', 'true');
        }
    };

    // Mobile: Only 3 simple steps, all centered
    const mobileSteps = [
        {
            target: 'body',
            content: t('tour.mobile.step1'),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: 'body',
            content: t('tour.mobile.step2'),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: 'body',
            content: t('tour.mobile.step3'),
            placement: 'center',
            disableBeacon: true,
        }
    ];

    // Desktop: Full tour with targeted elements
    const desktopSteps = [
        {
            target: 'body',
            content: (
                <div>
                    <strong>{t('tour.welcome')}</strong>
                    <p style={{ marginTop: 8 }}>{t('tour.intro')}</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="add-expense-trigger"]',
            content: t('tour.desktop.add'),
            placement: 'bottom',
        },
        {
            target: '[data-tour="dashboard-stats"]',
            content: t('tour.desktop.stats'),
            placement: 'bottom',
        },
        {
            target: '[data-tour="manage-budget-link"]',
            content: t('tour.desktop.budget'),
            placement: 'right',
        },
        {
            target: '[data-tour="filters"]',
            content: t('tour.desktop.filters'),
            placement: 'bottom',
        }
    ];

    const steps = isMobile ? mobileSteps : desktopSteps;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            disableScrolling={isMobile}
            disableOverlayClose={false}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: isDarkMode ? '#1e293b' : '#fff',
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    overlayColor: 'rgba(0, 0, 0, 0.7)',
                    primaryColor: '#8b5cf6',
                    textColor: isDarkMode ? '#e2e8f0' : '#334155',
                    zIndex: 10000,
                    width: isMobile ? 260 : 320,
                },
                tooltip: {
                    padding: isMobile ? 12 : 16,
                    borderRadius: 12,
                    fontSize: isMobile ? 13 : 14,
                },
                tooltipContent: {
                    padding: isMobile ? '4px 0' : '8px 0',
                },
                buttonNext: {
                    backgroundColor: '#8b5cf6',
                    borderRadius: 8,
                    padding: isMobile ? '6px 12px' : '8px 16px',
                    fontSize: isMobile ? 12 : 13,
                },
                buttonBack: {
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    fontSize: isMobile ? 12 : 13,
                    marginRight: 8,
                },
                buttonSkip: {
                    color: isDarkMode ? '#64748b' : '#94a3b8',
                    fontSize: isMobile ? 11 : 12,
                },
                spotlight: {
                    borderRadius: 8,
                },
            }}
            locale={{
                back: 'Back',
                close: 'X',
                last: 'Done',
                next: 'Next',
                skip: 'Skip',
            }}
        />
    );
};

export default AppTour;
