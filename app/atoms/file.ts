import type { ChangeEvent } from "react";
import { atom } from "jotai";
import { formatBytes, verifyAccept } from "~/utils";

export const fileErrorAtom = atom<string | undefined>(undefined);

/** Validates the file atom */
export const validateFileAtom = atom(
  null,
  (_get, set, event: ChangeEvent<HTMLInputElement>) => {
    set(fileErrorAtom, () => {
      const file = event?.target?.files?.[0];
      if (file) {
        const allowedType = verifyAccept(file.type, event.target.accept);
        const maxSize = event.target.size || 4_000_000;
        const allowedSize = file.size < maxSize;

        if (!allowedType) {
          event.target.value = "";
          return `Allowed file types are: ${
            event.target.accept === "pdf" ? "PDF" : "PNG, JPG or JPEG"
          }`;
        }

        if (!allowedSize) {
          /** Clean the field */
          event.target.value = "";
          return `Max file size is ${formatBytes(maxSize)}`;
        }

        return undefined;
      }
    });
  }
);
