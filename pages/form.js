import Head from "next/head";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ErrorMessage } from "@hookform/error-message";
import AuthLayout from "../layouts/AuthLayout";
import FormCard from "../components/common/FormCard";
import Field from "../components/common/Field";
import Label from "../components/common/Label";
import TextField from "../components/common/TextField";
import TextArea from "../components/common/TextArea";
import ErrorText from "../components/common/ErrorText";
import Button from "../components/common/Button";

const schema = yup.object().shape({
    username: yup.string().required(),
    description: yup.string().required(),
});

const defaultValues = {
    username: "",
    description: "",
};

export default function Form() {
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues,
    });

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <AuthLayout>
            <Head>
                <title>Form</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <FormCard>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <Field>
                            <Label htmlFor="username">Username:</Label>
                            <TextField id="username" name="username" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="username"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="description">Description:</Label>
                            <TextArea id="description" name="description" />
                            <ErrorMessage
                                errors={methods.formState.errors}
                                name="username"
                                render={({ message }) => <ErrorText>{message}</ErrorText>}
                            />
                        </Field>

                        <div className="text-center">
                            <Button type="submit" variant="primary">
                                Login
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </FormCard>
        </AuthLayout>
    );
}
