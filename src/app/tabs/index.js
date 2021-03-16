import resolve from './resolve';
import search from './search';
import registrar from './registrar';
import error from './error/ErrorTabComponent';
import newAdmin from './newAdmin';
import faqTab from './faq';

export default {
  search,
  registrar,
  resolve,
  error,
  newAdmin,
  faqTab,
};

export { NewAdminTab } from './newAdmin';
export { HomeTab } from './home';
export { NotificationTab } from './notifications';
export { ResolveTab } from './resolve';
export { SearchTab } from './search';
export { RegistrarTab } from './registrar';
export { default as ErrorTab } from './error/ErrorTabContainer';
export { default as FaqTab } from './faq';
