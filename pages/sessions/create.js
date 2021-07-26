import Head from "next/head";
import useStep from "hooks/useStep";
import MainLayout from "layouts/MainLayout";
import Center from "components/common/Center";
import TitleText from "components/common/TitleText";
import Step1 from "components/sessions/create/Step1";
import Step2 from "components/sessions/create/Step2";
import Step3 from "components/sessions/create/Step3";

export default function Create() {
    const { step, formData, backwardStep, prevStep, nextStep, setFormData } = useStep();

    let stepElement = <></>;
    switch (step) {
        case 1:
            stepElement = <Step1 formData={formData} setFormData={setFormData} nextStep={nextStep} />;
            break;
        case 2:
            stepElement = (
                <Step2 formData={formData} setFormData={setFormData} prevStep={prevStep} nextStep={nextStep} />
            );
            break;
        case 3:
            stepElement = <Step3 formData={formData} setFormData={setFormData} backwardStep={backwardStep} />;
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
            <Center>
                <TitleText>Tạo nhóm để vote địa điểm</TitleText>
            </Center>
            {stepElement}
        </MainLayout>
    );
}
