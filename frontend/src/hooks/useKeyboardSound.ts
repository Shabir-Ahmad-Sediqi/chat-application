
const keyStrokeSounds:HTMLAudioElement[] = [
    new Audio("/sounds/keystroke1.mp3"),
    new Audio("/sounds/keystroke2.mp3"),
    new Audio("/sounds/keystroke3.mp3"),
    new Audio("/sounds/keystroke4.mp3"),
]

function useKeyboardSound(){
    const playRandomKeyStrokeSounds = () => {
        const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

        randomSound.currentTime = 0; // THIS LINE IS FOR BETTER UX
        randomSound.play().catch((error: unknown) => console.log("Audio Play Failed", error)); 
    };
    
    return {playRandomKeyStrokeSounds}
}

export default useKeyboardSound