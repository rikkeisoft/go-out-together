import React, { useState, memo } from "react";
import Head from "next/head";
import MainLayout from "../layouts/MainLayout";
import TitleText from "../components/common/TitleText";
import Step1 from "../components/sessions/Step1";
import Step2 from "../components/sessions/Step2";

export default function Sessions() {
    const [step, setStep] = useState(1);

    const prevStep = () => {
        setStep(step - 1);
    };

    const nextStep = () => {
        setStep(step + 1);
    };

    let stepElement = <></>;
    switch (step) {
        case 1:
            stepElement = <Step1 nextStep={nextStep} />;
            break;
        case 2:
            stepElement = <Step2 nextStep={nextStep} />;
            break;
        default:
            break;
    }

    return (
        <MainLayout>
            <Head>
                <title>Form</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="text-center mt-5">
                <TitleText>Tạo nhóm để vote địa điểm</TitleText>
            </div>
            {stepElement}
        </MainLayout>
    );
}
