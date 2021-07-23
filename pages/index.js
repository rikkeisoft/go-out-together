import Head from 'next/head';
import MainLayout from "../layouts/MainLayout";

export default function Home() {
    return (
        <MainLayout>
            <Head>
                <title>Home</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="text-blue-600">This is home page</div>
        </MainLayout>
    );
}
