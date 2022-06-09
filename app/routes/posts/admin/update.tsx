import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { UpdatePost } from "~/models/post.server";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

type ActionData =
    | {
        title: null | string;
        slug: null | string;
        markdown: null | string;
    }
    | undefined;

export default function PostSlug() {
    const data = useActionData();

    const transition = useTransition();
    const isUpdating = Boolean(transition.submission);

    let errors, values;
    if (data) {
        errors = data.errors;
        values = data.values;
    }
    return (
        <Form method="post" action="/posts/admin/update">
            <p>
                <label>
                    Post Title:{" "}
                    {errors?.title ? (
                        <em className="text-red-600">{errors.title}</em>
                    ) : null}
                    <input
                        type="text"
                        name="title"
                        className={inputClassName}
                        defaultValue={values.title}
                    />
                </label>
            </p>
            {/* <p>
                    <label>
                        Post Slug:{" "}
                        <input
                            type="text"
                            name="slug"
                            className={inputClassName}
                            disabled={true}
                        />
                    </label>
                </p> */}
            <input
                type="hidden"
                name="slug"
                value={values.slug}
            />
            <p>
                <label htmlFor="markdown">Markdown:
                    {errors?.markdown ? (
                        <em className="text-red-600">
                            {errors.markdown}
                        </em>
                    ) : null}</label>
                <br />
                <textarea
                    id="markdown"
                    rows={20}
                    name="markdown"
                    className={`${inputClassName} font-mono`}
                    defaultValue={values.markdown}
                />
            </p>
            <p className="text-right">
                <button
                    type="submit"
                    className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                    disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Post"}
                </button>
            </p>
        </Form>
    );
}

export const action: ActionFunction = async ({ request }) => {
    // TODO: remove me
    await new Promise((res) => setTimeout(res, 5000));

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const markdown = formData.get("markdown") as string;

    const errors = {
        title: title ? null : "Title is required",
        markdown: markdown ? null : "Markdown is required",
        slug: null
    };
    const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
    );
    if (hasErrors) {
        return json<ActionData>(errors);
    }

    invariant(
        typeof title === "string",
        "title must be a string"
    );
    invariant(
        typeof slug === "string",
        "slug must be a string"
    );
    invariant(
        typeof markdown === "string",
        "markdown must be a string"
    );

    await UpdatePost({ title, slug, markdown });

    return redirect("/posts/admin");
};