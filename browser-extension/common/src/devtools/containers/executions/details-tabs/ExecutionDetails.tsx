import React from "react";
import { ExecutionEvent } from "../../../types";
import { PropertyRow } from "@requestly-ui/resource-table";
import { getAppUrl } from "../../../../config";
import "./executionDetails.scss";

interface Props {
  execution: ExecutionEvent;
}

const ExecutionDetails: React.FC<Props> = ({ execution }) => {
  return (
    <div className="execution-details">
      <PropertyRow name="Request URL" value={execution.requestURL} />
      <PropertyRow
        name="Rule applied"
        value={
          <a target="_blank" href={getAppUrl(`/rules/editor/edit/${execution.rule.id}`)}>
            {execution.rule.name}
          </a>
        }
      />
      {/* <PropertyRow name="Modification" value={execution.modification} /> */}
    </div>
  );
};

export default ExecutionDetails;
