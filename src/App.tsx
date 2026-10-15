import { Theme } from './settings/types';
import { ESP32PinChecker } from './components/generated/ESP32PinChecker';

let theme: Theme = 'light';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  return (
    <>
      <ESP32PinChecker />
    </>
  ); // %EXPORT_STATEMENT%
}

export default App;
