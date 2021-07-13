import React from "react";
import { useForm } from "react-hook-form";
import { withRouter } from "react-router-dom";
import { useStateMachine } from "little-state-machine";
import updateAction from "./updateAction";
var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyYNFILTvHzPsq1B" }).base(
  "appw2hvpKRTQCbB4O"
);

async function validateCode(record, props, actions) {
  console.log("find record: ", record);
  base("Directory: Kohort Signups")
    .select({
      filterByFormula: `{Code}="${record.email}"`
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
        actions.updateAction({
          ticketCode: record.get("Code"),
          recordId: record.id
        });
        if (record.get("Completed?")) {
          props.history.push("./code/" + record.get("Code"));
        } else {
          props.history.push("./step2");
        }
        return;
      });
    });
}

const Crew = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const { actions, state } = useStateMachine({ updateAction });

  const onSubmit = (data) => {
    console.log("submit pressed");
    validateCode(data, props, actions);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Crew Members Kohort Signup</h2>
      <h2>Step 1</h2>
      <label>Email address</label>
      <input
        {...register("email", {
          required: true,
          // pattern: /^[a-zA-Z0-9_]{8,9}$/i
          type: "email"
        })}
        // defaultValue={state.ticketCode}
      />
      {errors.email && <p>Email address is invalid</p>}
      <input type="submit" />
    </form>
  );
};

export default withRouter(Crew);
