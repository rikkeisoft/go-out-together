import { memo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import MainLayout from "layouts/MainLayout";
import Center from "components/common/Center";
import FormCard from "components/common/FormCard";
import Button from "components/common/Button";
import MessageText from "components/common/MessageText";
import urls from "consts/urls";
import ButtonGroup from "components/common/ButtonGroup";
import CopyableLink from "components/common/CopyableLink";

const Step3 = memo(({ formData, setFormData, backwardStep }) => {
    const router = useRouter();

    return (
        <MainLayout>
            <Head>
                <title>Bước 3</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Center>
                <MessageText>Chia sẻ link với bạn bè để họ tham gia vote</MessageText>
                <CopyableLink
                    text="https://xxx.yyy/sessions/1"
                    onClick={() => {
                        router.push("/sessions/1");
                    }}
                >
                    https://xxx.yyy/sessions/1
                </CopyableLink>
            </Center>
            <FormCard>
                <ButtonGroup>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                            router.push(urls.HOME);
                        }}
                    >
                        Về trang chủ
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                            setFormData();
                            backwardStep();
                        }}
                    >
                        Về trang chủ
                    </Button>
                </ButtonGroup>
            </FormCard>
        </MainLayout>
    );
});

Step3.propTypes = {
    formData: PropTypes.object,
    setFormData: PropTypes.func,
    backwardStep: PropTypes.func,
};

Step3.defaultProps = {};

export default Step3;
