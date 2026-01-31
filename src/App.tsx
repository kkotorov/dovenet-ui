import AppRouter from './routes/AppRouter';
import './i18n';
import './index.css';
import { PageHeaderProvider } from './components/utilities/PageHeaderContext';

export default function App() {
  return (
    <PageHeaderProvider>
      <AppRouter />
    </PageHeaderProvider>
  );
}
