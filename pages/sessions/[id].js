import Head from "next/head";
import useStep from "hooks/useStep";
import { useRouter } from "next/router";
import MainLayout from "layouts/MainLayout";
import Center from "components/common/Center";
import TitleText from "components/common/TitleText";
import Step1 from "components/sessions/details/Step1";
import Step2 from "components/sessions/details/Step2";
import Step3 from "components/sessions/details/Step3";

export default function Details() {
    const router = useRouter();
    const { id } = router.query;

    const { step, formData, prevStep, nextStep, setFormData } = useStep();
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
            stepElement = <Step3 />;
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
                <TitleText>
                    Bạn đang tham gia nhóm: <span className="text-blue-500">{id}</span>
                </TitleText>
            </Center>
            {stepElement}
        </MainLayout>
    );
}
