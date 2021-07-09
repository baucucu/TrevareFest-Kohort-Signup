import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStateMachine } from "little-state-machine";
import updateAction from "./updateAction";
import {
  // BrowserRouter as Router,
  // Switch,
  // Route,
  // Link,
  // Redirect,
  useParams
  // useRouteMatch
} from "react-router-dom";

import { withRouter } from "react-router-dom";
import {
  ReactPDF,
  Page,
  // Text,
  View,
  Document,
  StyleSheet
} from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4"
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

// Create Document Component
const Qrpdf = (props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <img alt="QR code" src={props.url} width="100%"></img>
      </View>
    </Page>
  </Document>
);

var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyYNFILTvHzPsq1B" }).base(
  "appw2hvpKRTQCbB4O"
);

const Used = (props) => {
  const { actions, state } = useStateMachine({ updateAction });

  let { code } = useParams();

  function savePDF(url) {
    ReactPDF.render(<Qrpdf url={url} />, `${__dirname}/QR.pdf`);
  }

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

  const {
    register,
    handleSubmit
    // formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    console.log("save pdf pressed: ", data);
    savePDF(data);
  };

  useEffect(() => {
    getTicket(code);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {state.record && (
        <div>
          <h2>
            Ticket code <mark>{code}</mark> is registered for{" "}
            <mark>{state.record.fields["Kohort Name"]}</mark>
          </h2>
          <h2>Use the following QR code</h2>
          <Qrpdf url={state.record.fields.QR[0].url} />
        </div>
      )}
      <input
        style={{ display: "none" }}
        {...register("url", {
          required: true,
          pattern: /^[a-zA-Z0-9_]{8,9}$/i
        })}
        value={state.record.fields.QR[0].url}
      />
      {/* <input
        // onclick={() => savePDF(state.record.fields.QR[0].url)}
        type="submit"
        value="SAVE PDF"
        style={{ backgroundColor: "teal", color: "white", width: "100%" }}
      /> */}
    </form>
  );
};

export default withRouter(Used);
