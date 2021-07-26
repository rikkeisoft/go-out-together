import { memo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ErrorMessage } from "@hookform/error-message";
import urls from "consts/urls";
import AuthLayout from "layouts/AuthLayout";
import FormCard from "components/common/FormCard";
import Field from "components/common/Field";
import Label from "components/common/Label";
import TextField from "components/common/TextField";
import ErrorText from "components/common/ErrorText";
import ButtonGroup from "components/common/ButtonGroup";
import Button from "components/common/Button";

const schema = yup.object().shape({
    name: yup.string().required("Nhập vào tên"),
    address: yup.string().required("Nhập vào địa điểm"),
});

const Step1 = memo(({ formData, setFormData, nextStep }) => {
    const router = useRouter();

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: formData,
    });

    const onSubmit = (data) => {
        setFormData(Object.assign({}, formData, data));
        nextStep();
    };

    return (
        <AuthLayout>
            <Head>
                <title>Bước 1</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <FormCard>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <Field>
                            <Label htmlFor="name">Tên:</Label>
                            <TextField id="name" name="name" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="name"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="address">Địa điểm:</Label>
                            <TextField id="address" name="address" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="address"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

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

                            <Button type="submit" variant="primary" onClick={() => {}}>
                                Tiếp theo
                            </Button>
                        </ButtonGroup>
                    </form>
                </FormProvider>
            </FormCard>
        </AuthLayout>
    );
});

Step1.propTypes = {
    formData: PropTypes.object,
    setFormData: PropTypes.func,
    nextStep: PropTypes.func,
};

Step1.defaultProps = {};

export default Step1;
