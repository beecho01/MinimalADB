import { Link } from "@fluentui/react-components";
import React from "react";

export const showLicenseDialog = (showDialog: (title: string, message: React.ReactNode) => void) => {
  showDialog(
    "Software License Details",
    <span>
      MinimalADB and its third-party components are licensed under the following terms:
      <ul>
        <li>
          MinimalADB:{" "}
          <Link href="https://github.com/beecho01/MinimalADB/blob/main/LICENSE" target="_blank">
            MIT License
          </Link>
        </li>
        <li>
          Android Platform Tools:{" "}
          <Link href="https://developer.android.com/license" target="_blank">
            Apache License 2.0
          </Link>
        </li>
        <li>
          Jetbrains Mono Font:{" "}
          <Link href="https://www.jetbrains.com/lp/mono/#license" target="_blank">
            SIL Open Font License 1.1
          </Link>
        </li>
        <li>
          Electron:{" "}
          <Link href="https://github.com/electron/electron/blob/main/LICENSE" target="_blank">
            MIT License
          </Link>
        </li>
      </ul>
    </span>,
  );
};
