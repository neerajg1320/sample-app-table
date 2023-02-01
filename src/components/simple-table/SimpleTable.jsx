import {TableWrapper} from '@glassball/table';
import {useMemo, useState, useRef, useCallback} from "react";

function SimpleTable() {
  const [data, setData] = useState([
    {
      name: "Alice",
      age: 25
    },
    {
      name: "Bob",
      age: 26
    },
  ]);

  const [ledgers, setLedgers] = useState([]);
  // The following two could be turned to refs
  const [modifiedRows, setModifiedRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const tallySavedRef = useRef(false);

  const columns = useMemo(
      () => {
        return [
          {
            Header: "Name",
            accessor: "name",
          },
          {
            Header: "Type",
            accessor: "age",
          }
        ]
      }, []);

  const updateModifiedRows = useCallback((indices) => {
    setModifiedRows((prev) => {
      const newIds = indices.filter(index => !prev.includes(index));
      return [...prev, ...newIds];
    });
  }, [setModifiedRows]);

  const updateDeletedRows = useCallback((indices) => {
    setDeletedRows((prev) => {
      const newIds = indices.filter(index => !prev.includes(index));
      return [...prev, ...newIds];
    });

    // Remove the deleted indices from the modifiedRows
    setModifiedRows((prev) => {
      return prev.filter(index => !indices.includes(index))
    });
  }, [setDeletedRows, setModifiedRows]);

  const clearMarkedRows = useCallback(() => {
    setModifiedRows([]);
    setDeletedRows([]);
  }, [setModifiedRows, setDeletedRows]);

  // The App component just maintains a copy of data.
  // The modification are done in table and tally components.
  const handleDataChange = useCallback((data, updates, source) => {
    // console.log(`handleDataChange: source=${source} tallySaved=${tallySavedRef.current} data=`, data);

    let newData = data;

    // TBD: We can do the below asynchronously
    // In case it is a data modify or delete action

    if (source === "dataSourceFileReader") {
      const indices = data.map((item,index) => index);
      if (indices.length > 0) {
        setModifiedRows(indices);
        tallySavedRef.current = false;
      }
    } else if (source === "dataSourceTable") {
      if (updates) {
        // console.log(`App:handleDataChange`, updates, data);
        const modificationUpdates = updates.filter(update => update.action === 'PATCH');
        const modifiedIndices = modificationUpdates.reduce((prev, update) => {
          const newIds = update.payload.indices.filter(index => !prev.includes(index));
          return [...prev, ...newIds];
        }, [])
        if (modifiedIndices.length > 0) {
          updateModifiedRows(modifiedIndices);
        }

        const deletionUpdates = updates.filter(update => update.action === 'DELETE');
        const deletedIndices = deletionUpdates.reduce((prev, update) => {
          const newIds = update.payload.indices.filter(index => !prev.includes(index));
          return [...prev, ...newIds];
        }, [])
        if (deletedIndices.length > 0) {
          // TBD: This is the place where we need to check if data is in sync with server
          if (tallySavedRef.current) {
            updateDeletedRows(deletedIndices);
          } else {
            newData = data.filter((item, index) => !deletedIndices.includes(index));
          }
        }
      }
    } else if (source === "dataSourceTally") {
      // We can count the Tally Operations here. This will happen only if data is submitted to Tally
      // We should get the indices here and clear the modifiedRows
      // console.log(`handleDataChange: source:${source} updates=`, updates);

      const responseIds = updates[0].payload;

      // We need to be very careful here
      // We need to check if all responses are accounted
      if (responseIds.length > 0) {
        clearMarkedRows();
        tallySavedRef.current = true;
      }

    } else {
      console.error(`handleDataChange: source '${source}' not supported`);
    }

    setData(newData);
  }, []);

  return (
      <>
        <h1>Table Tagger</h1>
        {/*<TableTagger {...{data, columns}} />*/}
        <TableWrapper data={data} onDataChange={handleDataChange} ledgers={ledgers} />
      </>
  );
}

export default SimpleTable;
