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

const Step3 = memo(({}) => {
    const router = useRouter();

    return (
        <MainLayout>
            <Head>
                <title>Bước 3</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Center>
                <MessageText>Địa chỉ được vote nhiều nhất là Địa điểm 1 ( 25 người vote)</MessageText>
            </Center>
            <FormCard>
                <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                        router.push(urls.HOME);
                    }}
                >
                    Về trang chủ
                </Button>
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
