import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { withRouter } from "react-router-dom";
import { useStateMachine } from "little-state-machine";
import updateAction from "./updateAction";
import { yupResolver } from "@hookform/resolvers/yup";
import "yup-phone";
import * as Yup from "yup";
var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyYNFILTvHzPsq1B" }).base(
  "appw2hvpKRTQCbB4O"
);

const Step2 = (props) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    phone: Yup.string().phone().required("Phone is required"),
    kohort: Yup.string()
      .oneOf(["Kohort 1", "Kohort 2", null], "Kohort is required")
      .required("Kohort is required"),
    gdpr: Yup.bool().oneOf([true], "Accept GDPR is required")
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm(formOptions);
  // const { register, handleSubmit } = useForm();
  const { state, actions } = useStateMachine({ updateAction });

  const onSubmit = (data) => {
    console.log("data: ", data);
    actions.updateAction(data);
    reset();
    saveKohortData(data, state);
  };

  async function saveKohortData(data, state) {
    base("Directory: Kohort Signups").update(
      [
        {
          id: state.recordId,
          fields: {
            Name: data.name,
            Phone: data.phone,
            Kohort: [
              state.kohorts.filter((kohort) => kohort.name === data.kohort)[0]
                ?.id
            ],
            GDPR: data.gdpr,
            "Completed?": true
          }
        }
      ],
      function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          console.log("record updated: ", record.get("Code"));
          props.history.push("./code/" + record.get("Code"));
        });
      }
    );
  }

  async function getKohorts() {
    let view = "Available";
    if (state?.ticketCode?.includes("@")) {
      view = "Crew";
    }
    base("Directory: Kohorts")
      .select({
        view: view
      })
      .firstPage(function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        actions.updateAction({
          kohorts: records.map((record) => {
            return { id: record.id, name: record.fields.Name };
          })
        });
      });
  }

  useEffect(() => {
    getKohorts();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        This is kohort signup form, exclusively for holders of a Trevarefest
        2021 ticket. Contact hei@trevarefest.no for any questions and technical
        issues.{" "}
      </label>
      <h2>Name of ticket holder</h2>
      <label>
        You need to enter the name of the person who will use this festival
        ticket.{" "}
      </label>
      <input
        type="text"
        placeholder="Enter your name"
        // defaultValue={state.name}
        {...register("name", {
          required: true,
          maxLength: 80
        })}
      />
      {errors.name && <p>Name is required</p>}
      <h2>Phone number</h2>
      <label>
        We need your phone number in case the health authorities needs to get in
        contact with you.{" "}
      </label>
      <input
        type="tel"
        placeholder="Enter your phone number"
        {...register("phone", {
          required: true,
          minLength: 6,
          maxLength: 12
        })}
      />
      {errors.phone && <p>Phone is required</p>}
      <h2>Kohort</h2>
      <label>
        See more information on https://www.trevarefest.no/program about the
        different Kohort schedules.{" "}
      </label>
      <select {...register("kohort", { required: true })}>
        <option value={null}></option>
        {state?.kohorts &&
          state.kohorts.map((kohort) => {
            return (
              <option key={kohort.id} value={kohort.name}>
                {kohort.name}
              </option>
            );
          })}
        {/* <option value="Kohort 1">Kohort 1</option>
        <option value="Kohort 2">Kohort 2</option> */}
      </select>
      {errors.kohort && <p>Kohort is required</p>}
      <h2>GDPR agreement</h2>
      <label>
        Please accept that Trevarefest (VAT Number 918118314; contact at
        hei@trevarefest.no) can store the name and phone number of the ticket
        holder for a maximum of up to two weeks after the festival. We are
        storing this data in case the health authorities needs it in tracing a
        corona virus outbreak.
      </label>
      <input
        style={{ display: "flex", marginTop: 20 }}
        type="checkbox"
        placeholder="GDPR agreement"
        {...register("gdpr", {})}
      />
      <label>Accept</label>
      {errors.gdpr && <p>GDPR agreement is required</p>}
      <input type="submit" />
    </form>
  );
};

export default withRouter(Step2);
