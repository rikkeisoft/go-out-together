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
    name: yup.string().required("Nhập vào tên"),
    address: yup.string().required("Nhập vào địa điểm"),
});

const defaultValues = {
    name: "",
    address: "",
};

const Step1 = memo(({nextStep}) => {
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

Step1.propTypes = {
    nextStep: PropTypes.func,
};

Step1.defaultProps = {};

export default Step1;

