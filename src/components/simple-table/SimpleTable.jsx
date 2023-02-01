import {TableWrapper} from '@glassball/table';
import {useMemo} from "react";

function SimpleTable() {
  const data = useMemo(() => {
    return [
      {
        name: "Alice",
        gender: "female"
      },
      {
        name: "Bob",
        gender: "male",
      }
    ]
  });

  return (
      <div>
        <h1>Simple Table</h1>
        <TableWrapper data={data} />
      </div>
  );
}

export default SimpleTable;
