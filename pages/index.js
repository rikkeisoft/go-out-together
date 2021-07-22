import Head from 'next/head';
import AuthLayout from "../layouts/AuthLayout";

export default function Home() {
    return (
        <AuthLayout>
            <Head>
                <title>Home</title>
            </Head>
            This is home page
        </AuthLayout>
    );
}
