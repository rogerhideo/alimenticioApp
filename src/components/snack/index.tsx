import Snackbar from 'react-native-snackbar';

export type snackMessageType = 'success' | 'error' | 'warning';

export const Snack = (
  type: snackMessageType,
  message: string,
  action?: {
    text: string;
    color: string;
    onPress: () => void;
  },
) => {
  const handleActionColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#BBD034';
      case 'error':
        return '#E95656';
      case 'warning':
        return '#F4AF28';
      default:
        return '#6EC0F4';
    }
  };

  Snackbar.show({
    text: message,
    duration: 4000,
    backgroundColor: handleActionColor(type),
    textColor: '#fff',
    action: action ? action : undefined,
  });
};
