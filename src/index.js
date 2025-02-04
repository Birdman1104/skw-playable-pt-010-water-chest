import '../styles/index.scss';
import App from './App';

window.soundMute = (value) => {
    window.game.soundMute(value);
};

window.createGame = () => {
    window.game = new App();
    window.game.init();

    window.addEventListener('resize', () => window.game.appResize());
    window.addEventListener('orientationchange', () => window.game.appResize());
    window.addEventListener('visibilitychange', (e) => window.game.onVisibilityChange(e));
    window.addEventListener('focus', () => window.game.onFocusChange(true));
    window.addEventListener('blur', () => window.game.onFocusChange(false));
};

function isAppleDevice() {
    return /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !window.MSStream;
}

window.CTACallImitation = () => {
    if (isAppleDevice()) {
        window.open('https://apps.apple.com/us/app/pirate-treasures-gems-puzzle/id990972073');
    } else {
        window.open('https://play.google.com/store/apps/details?id=com.orangeapps.piratetreasure');
    }
};
