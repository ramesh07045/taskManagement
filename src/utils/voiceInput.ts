import Voice, {
    SpeechResultsEvent,
    SpeechErrorEvent,
} from '@react-native-voice/voice';
import { PermissionsAndroid, Platform } from 'react-native';

// Request mic permission
export async function requestMicPermission() {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: 'Microphone Permission',
                message: 'This app needs access to your microphone for voice input.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handled in Info.plist
}

// Start recognition
export async function startVoiceRecognition(
    onResult: (text: string) => void
) {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
        console.log('Microphone permission denied');
        return;
    }

    // 🔑 Set up listeners before starting
    Voice.onSpeechStart = () => console.log('Speech started');
    Voice.onSpeechEnd = () => console.log('Speech ended');
    Voice.onSpeechError = (event: SpeechErrorEvent) =>
        console.log('Error:', event.error);

    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
        if (event.value && event.value.length > 0) {
            console.log('Speech results:', event.value);
            onResult(event.value[0]); // pick first match
        }
    };

    try {
        console.log('Starting voice recognition...');
        await Voice.start('en-US'); // or "ta-IN" for Tamil
    } catch (e) {
        console.error('Voice start error:', e);
    }
}

// Stop recognition
export async function stopVoiceRecognition() {
    try {
        await Voice.stop();
        await Voice.destroy();
        Voice.removeAllListeners();
        console.log('Stopped voice recognition');
    } catch (e) {
        console.error('Voice stop error:', e);
    }
}
