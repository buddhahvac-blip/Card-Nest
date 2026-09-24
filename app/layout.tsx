import './globals.css';
export const metadata = { title: 'CardNest', description: 'A friendly marketplace for collectible cards.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
