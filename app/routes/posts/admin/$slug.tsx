import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type { Post } from "~/models/post.server";
import { getPost, updatePost } from "~/models/post.server";

type LoaderData = { post: Post };

export const loader: LoaderFunction = async ({ params }) => {
    invariant(params.slug, `params.slug is required`);

    const post = await getPost(params.slug);

    invariant(post, `Post not found: ${params.slug}`);

    return json<LoaderData>({ post });
};

type ActionData =
    | {
        title: null | string;
        markdown: null | string;
    }
    | undefined;

export const action: ActionFunction = async ({ request, params }) => {
    // TODO: remove me
    await new Promise((res) => setTimeout(res, 2000));

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const slug = params.slug;
    const markdown = formData.get("markdown") as string;

    const errors = {
        title: title ? null : "Title is required",
        markdown: markdown ? null : "Markdown is required",
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
        typeof markdown === "string",
        "markdown must be a string"
    );
    invariant(typeof slug === 'string');

    await updatePost({ title, slug, markdown });

    return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function PostSlug() {
    const errors = useActionData();

    const transition = useTransition();
    const isUpdating = Boolean(transition.submission);

    const { post } = useLoaderData<LoaderData>();
    console.log(post);
    return (
        <Form method="put">
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
                        key={post?.title}  //required, data wil not be updated when post url changed if missing 
                        defaultValue={post?.title}
                    />
                </label>
            </p>
            <p>
                <label htmlFor="markdown">Markdown:
                    {errors?.markdown ? (
                        <em className="text-red-600">
                            {errors.markdown}
                        </em>
                    ) : null}
                </label>
                <br />
                <textarea
                    id="markdown"
                    rows={20}
                    name="markdown"
                    className={`${inputClassName} font-mono`}
                    key={post?.markdown}
                    defaultValue={post?.markdown}
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



