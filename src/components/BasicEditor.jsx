import React, { useCallback, useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { sizeMap, fontFamilyMap } from "../utils/SlateUtilityFunctions";
import Toolbar from "../Toolbar/Toolbar";
import Link from "../Elements/Link/Link";
import Image from "../Elements/Embed/Image";
import Video from "../Elements/Embed/Video";
import Equation from "../Elements/Equation/Equation";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
} from "docx";
import { saveAs } from "file-saver";

const editor = withReact(createEditor());

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "headingOne":
      return <h1 {...attributes}>{children}</h1>;
    case "headingTwo":
      return <h2 {...attributes}>{children}</h2>;
    case "headingThree":
      return <h3 {...attributes}>{children}</h3>;
    case "blockquote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "alignLeft":
      return (
        <div style={{ textAlign: "left" }} {...attributes}>
          {children}
        </div>
      );
    case "alignCenter":
      return (
        <div style={{ textAlign: "center" }} {...attributes}>
          {children}
        </div>
      );
    case "alignRight":
      return (
        <div style={{ textAlign: "right" }} {...attributes}>
          {children}
        </div>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "orderedList":
      return <ol {...attributes}>{children}</ol>;
    case "unorderedList":
      return <ul {...attributes}>{children}</ul>;
    case "link":
      return <Link {...element} />;
    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return <td {...attributes}>{children}</td>;
    case "image":
      return <Image {...element} />;
    case "video":
      return <Video {...element} />;
    case "equation":
      return <Equation {...element} />;
    default:
      return <div {...attributes}>{children}</div>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.strikethrough) {
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }

  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }

  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }

  if (leaf.bgColor) {
    children = (
      <span style={{ backgroundColor: leaf.bgColor }}>{children}</span>
    );
  }

  if (leaf.fontSize) {
    const size = sizeMap[leaf.fontSize];
    children = <span style={{ fontSize: size }}>{children}</span>;
  }

  if (leaf.fontFamily) {
    const family = fontFamilyMap[leaf.fontFamily];
    children = <span style={{ fontFamily: family }}>{children}</span>;
  }

  return <span {...attributes}>{children}</span>;
};

const BasicEditor = () => {
  const [value, setValue] = useState(initialDocument);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const handleExport = async () => {
    const children = value.map((node) => {
      switch (node.type) {
        case "paragraph":
          return new Paragraph({
            children: node.children.map(
              (leaf) =>
                new TextRun({
                  text: leaf.text,
                  bold: leaf.bold,
                  italics: leaf.italic,
                  underline: leaf.underline,
                  strike: leaf.strikethrough,
                  subscript: leaf.subscript,
                  superscript: leaf.superscript,
                  color: leaf.color,
                  shading: leaf.bgColor
                    ? {
                        type: "clear",
                        fill: leaf.bgColor.replace("#", ""),
                      }
                    : undefined,
                  size: sizeMap[leaf.fontSize],
                  font: fontFamilyMap[leaf.fontFamily],
                })
            ),
          });

        case "orderedList":
          return node.children.map(
            (item, index) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. `,
                  }),
                  ...item.children.map(
                    (leaf) =>
                      new TextRun({
                        text: leaf.text,
                        bold: leaf.bold,
                        italics: leaf.italic,
                        underline: leaf.underline,
                        strike: leaf.strikethrough,
                        subscript: leaf.subscript,
                        superscript: leaf.superscript,
                        color: leaf.color,
                        shading: leaf.bgColor
                          ? {
                              type: "clear",
                              fill: leaf.bgColor.replace("#", ""),
                            }
                          : undefined,
                        size: sizeMap[leaf.fontSize],
                        font: fontFamilyMap[leaf.fontFamily],
                      })
                  ),
                ],
              })
          );

        case "unorderedList":
          return node.children.map(
            (item) =>
              new Paragraph({
                bullet: {
                  level: 0,
                },
                children: item.children.map(
                  (leaf) =>
                    new TextRun({
                      text: leaf.text,
                      bold: leaf.bold,
                      italics: leaf.italic,
                      underline: leaf.underline,
                      strike: leaf.strikethrough,
                      subscript: leaf.subscript,
                      superscript: leaf.superscript,
                      color: leaf.color,
                      shading: leaf.bgColor
                        ? {
                            type: "clear",
                            fill: leaf.bgColor.replace("#", ""),
                          }
                        : undefined,
                      size: sizeMap[leaf.fontSize],
                      font: fontFamilyMap[leaf.fontFamily],
                    })
                ),
              })
          );

        default:
          return new Paragraph(
            node.children.map((leaf) => new TextRun(leaf.text))
          );
      }
    });

    // Flatten the children array to handle nested arrays from lists
    const flattenedChildren = children.flat();

    const doc = new Document({
      sections: [
        {
          children: flattenedChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(
      new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      "document.docx"
    );
  };

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <div className="App">
        <Toolbar />
        <div className="Editor">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter paragraph "
          />
        </div>
        <button className="t" onClick={handleExport}>
          Export to .docx
        </button>
      </div>
    </Slate>
  );
};

const initialDocument = [
  {
    type: "paragraph",
    children: [
      {
        text: "",
      },
    ],
  },
];

export default BasicEditor;
