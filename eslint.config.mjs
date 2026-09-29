import {globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
export default [...nextVitals,globalIgnores(['.next/**','legacy-app/**','node_modules/**'])];
