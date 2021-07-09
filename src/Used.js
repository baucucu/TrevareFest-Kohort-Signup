import React, { useEffect } from "react";
import { useStateMachine } from "little-state-machine";
import updateAction from "./updateAction";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useParams,
  useRouteMatch
} from "react-router-dom";

import { withRouter } from "react-router-dom";

var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyYNFILTvHzPsq1B" }).base(
  "appw2hvpKRTQCbB4O"
);

const Used = (props) => {
  const { actions, state } = useStateMachine({ updateAction });

  let { code } = useParams();

  async function getTicket(code) {
    base("Directory: Kohort Signups")
      .select({
        filterByFormula: `{Code}="${code}"`
      })

      .firstPage(function (err, records) {
        if (err) {
          console.error("error: ", err);
          return;
        } else if (records.length === 0) {
          console.log("no record found");
          props.history.push("./invalid");
          return;
        }
        records.forEach(function (record) {
          console.log("Retrieved", record.id, " - ", record.get("Code"));
          console.log(
            "record fields: ",
            JSON.stringify(Object.keys(record.fields))
          );
          console.log(
            "QR image url: ",
            JSON.stringify(record.fields.QR[0].url)
          );
          actions.updateAction({
            record: record
          });
          return;
        });
      });
  }

  useEffect(() => {
    getTicket(code);
  }, []);
  return (
    <>
      {state.record && (
        <div>
          <h2>
            Ticket code <mark>{code}</mark> is registered for{" "}
            <mark>{state.record.fields["Kohort Name"]}</mark>
          </h2>
          <h2>Use the following QR code</h2>
          <img
            alt="QR code"
            src={state.record.fields.QR[0].url}
            width="240px"
          ></img>
          <input type="submit" value="Save PDF" />
        </div>
      )}
    </>
  );
};

export default withRouter(Used);
