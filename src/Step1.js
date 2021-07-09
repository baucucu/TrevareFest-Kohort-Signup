import React, { text } from "react";
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
      filterByFormula: `{Code}="${record.ticketCode}"`
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

const Step1 = (props) => {
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
      <h2>Kohort Signup</h2>
      <h2 style={{ fontSize: "18px" }}>
        This is kohort signup form, exclusively for holders of a Trevarefest
        2021 ticket. Contact hei@trevarefest.no for any questions and technical
        issues.{" "}
      </h2>
      <h2>Step 1</h2>

      <label>QR code number:</label>
      <input
        {...register("ticketCode", {
          required: true,
          pattern: /^[a-zA-Z0-9_]{8,9}$/i
        })}
        // defaultValue={state.ticketCode}
      />
      {errors.ticketCode && <p>Ticket code invalid</p>}
      <input type="submit" value="Validate QR code number" color="green" />
    </form>
  );
};

export default withRouter(Step1);
