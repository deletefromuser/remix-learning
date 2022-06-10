import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from 'tiny-invariant';
import { getPost, updatePost } from "~/models/post.server";

type PostError = {
    title?: boolean
    slug?: boolean
    markdown?: boolean
}

export const loader: LoaderFunction = async ({ params }) => {
    invariant(params.slug, 'expected params.slug')
    return json(await getPost(params.slug))
}

export const action: ActionFunction = async ({ request, params }) => {
    invariant(params.slug, 'expected params.slug')

    const formData = await request.formData()
    const title = formData.get('title') // FormDateEntryValue | null
    const slug = params.slug
    const markdown = formData.get('markdown') // FormDateEntryValue | null

    const errors: PostError = {
        ...(!title && { title: true }),
        ...(!markdown && { markdown: true }),
    }

    if (Object.keys(errors).length) {
        return json(errors)
    }

    invariant(typeof title === 'string')
    invariant(typeof slug === 'string')
    invariant(typeof markdown === 'string')
    await updatePost({ title, slug, markdown })

    return redirect('/posts/admin')
}

function Error({ children }: { children: string }): JSX.Element {
    return <em className="text-red-500">{children}</em>
}

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function EditPost() {
    const errors = useActionData()
    const post = useLoaderData()

    const transition = useTransition();
    const isCreating = Boolean(transition.submission);

    console.log({ post })

    return (
        <Form method="put">
            <p>
                <label>
                    Post Title:{' '}
                    <input
                        key={post?.title}
                        defaultValue={post?.title}
                        type="text"
                        name="title"
                        className={inputClassName}
                    />
                    {errors?.title ? <Error>Title is required</Error> : null}
                </label>
            </p>
            <p>
                <label htmlFor="markdown">Post Body (Markdown Format):</label>{' '}
                {errors?.markdown ? <Error>Body is required</Error> : null}
                <br />
                <textarea
                    key={post?.markdown}
                    defaultValue={post?.markdown}
                    id="markdown"
                    rows={20}
                    name="markdown"
                    className={`${inputClassName} font-mono`}
                />
            </p>
            <p className="text-right">
                <button
                    type="submit"
                    className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                    disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Post"}
                </button>
            </p>
        </Form>
    )
}