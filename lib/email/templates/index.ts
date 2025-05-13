import ReactDOMServer from 'react-dom/server'
import { PasswordResetEmail, PasswordResetEmailProps } from "./password-reset-email"
import React from 'react'
import { htmlToText } from '@/lib/utils/common'

export const Templates = {
  "password-reset": PasswordResetEmail,
} as const

type TemplateMap = {
  "password-reset": PasswordResetEmailProps
}

export const getRenderedTemplate = <T extends keyof typeof Templates>(
  templateName: T,
  props: TemplateMap[T]
) => {
  const Template = Templates[templateName]
  if (!Template) {
    throw new Error(`Template ${templateName} not found`)
  }
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Template, props)
  )
  
  const fullHtml = `<!DOCTYPE html>${html}`;
  const text = htmlToText(fullHtml);

  return { html: fullHtml, text };
}