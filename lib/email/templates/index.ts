import React from "react"
import ReactDOMServer from "react-dom/server"
import { htmlToText } from "@/lib/utils/common"
import { PasswordResetEmail, PasswordResetEmailProps } from "./password-reset-email"
import { PasswordResetSuccessEmail, PasswordResetSuccessEmailProps } from "./password-reset-success"

export const TemplateMap = {
  "password-reset": PasswordResetEmail,
  "password-reset-success": PasswordResetSuccessEmail,
} as const

type TemplatePropTypeMap = {
  "password-reset": PasswordResetEmailProps,
  "password-reset-success": PasswordResetSuccessEmailProps,
}

export const getRenderedTemplate = <T extends keyof typeof TemplateMap>(
  templateName: T,
  props: TemplatePropTypeMap[T]
) => {
  const Template = TemplateMap[templateName]
  if (!Template) {
    throw new Error(`Template ${templateName} not found`)
  }
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Template as React.FunctionComponent<typeof props>, props)
  )
  
  const fullHtml = `<!DOCTYPE html>${html}`;
  const text = htmlToText(fullHtml);

  return { html: fullHtml, text };
}