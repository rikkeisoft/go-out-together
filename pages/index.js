import Head from 'next/head';
import AuthLayout from "../layouts/AuthLayout";

export default function Home() {
    return (
        <AuthLayout>
            <Head>
                <title>Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="text-blue-600">This is home page</div>
        </AuthLayout>
    );
}
