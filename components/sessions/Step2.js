import { memo } from "react";
import Head from "next/head";
import PropTypes from "prop-types";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ErrorMessage } from '@hookform/error-message';
import AuthLayout from "../../layouts/AuthLayout";
import FormCard from "../common/FormCard";
import Field from "../common/Field";
import Label from "../common/Label";
import TextField from "../common/TextField";
import TextArea from "../common/TextArea";
import ErrorText from "../common/ErrorText";
import Button from "../common/Button";

const schema = yup.object().shape({
    title: yup.string().required("Nhập vào tiêu đề"),
    content: yup.string().required("Nhập vào nội dung"),
    timeLimit: yup.string().required("Chọn giới hạn thời gian vote"),
    addresses: yup.string().required("Chọn địa điểm"),
});

const defaultValues = {
    title: "",
    content: "",
    timeLimit: "",
    addresses: "",
};

const Step2 = memo(({nextStep}) => {
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues,
    });

    const onSubmit = (data) => {
        console.log(data);
        nextStep();
    };

    return (
        <AuthLayout>
            <Head>
                <title>Bước 2</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <FormCard>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <Field>
                            <Label htmlFor="title">Tiêu đề:</Label>
                            <TextField id="title" name="title" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="title"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="content">Nội dung:</Label>
                            <TextField id="content" name="content" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="content"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="timeLimit">Giới hạn thời gian vote:</Label>
                            <TextField id="timeLimit" name="timeLimit" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="timeLimit"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="addresses">Các địa điểm ăn chơi:</Label>
                            <TextField id="addresses" name="addresses" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="addresses"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

                        <div className="text-center">
                            <Button type="submit" variant="primary">
                                Tiếp theo
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </FormCard>
        </AuthLayout>
    );
});

Step2.propTypes = {
    nextStep: PropTypes.func,
};

Step2.defaultProps = {};

export default Step2;

