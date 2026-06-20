export default function DoorsWindowsCalc() {
  return (
    <div
      style={{
        padding: 50,
        fontSize: 40,
        fontWeight: "bold",
        color: "red",
      }}
    >
      NEW BUILDMITRA CALCULATOR ACTIVE
    </div>
  );
}
import React, { useState } from "react";

type ItemType = {
  name: string;
  width: number;
  height: number;
  qty: number;
  shutters: number;
  wood: string;
  secWidth: number;
  secDepth: number;
  shutterThickness: number;
};

type BOQItem = {
  item: string;
  qty: string | number;
  unit: string;
  rate: number;
  amount: number;
};

const DoorsWindowsCalc = () => {

  // =====================================================
  // IS / PRACTICAL THUMB RULE BASED CALCULATOR
  // =====================================================

  const [doors, setDoors] = useState<ItemType[]>([
    {
      name: "Main Door",
      width: 3.5,
      height: 7,
      qty: 1,
      shutters: 1,
      wood: "Teak",
      secWidth: 150,
      secDepth: 100,
      shutterThickness: 35,
    },
    {
      name: "Internal Door",
      width: 3,
      height: 7,
      qty: 3,
      shutters: 1,
      wood: "Sal",
      secWidth: 125,
      secDepth: 75,
      shutterThickness: 32,
    },
  ]);

  const [windows, setWindows] = useState<ItemType[]>([
    {
      name: "Sliding Window",
      width: 4,
      height: 4,
      qty: 4,
      shutters: 2,
      wood: "Teak",
      secWidth: 100,
      secDepth: 60,
      shutterThickness: 30,
    },
  ]);

  const [vents, setVents] = useState<ItemType[]>([
    {
      name: "Ventilator",
      width: 2,
      height: 1.5,
      qty: 2,
      shutters: 1,
      wood: "Sal",
      secWidth: 75,
      secDepth: 50,
      shutterThickness: 25,
    },
  ]);

  const [boq, setBoq] = useState<BOQItem[]>([]);
  const [totalWood, setTotalWood] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // =====================================================
  // MARKET RATES
  // =====================================================

  const woodRates: Record<string, number> = {
    Teak: 4500,
    Sal: 3200,
    Honne: 3800,
    Rosewood: 6500,
  };

  // =====================================================
  // UTILITIES
  // =====================================================

  const mmToFt = (mm: number) => mm / 304.8;

  const round2 = (num: number) => Number(num.toFixed(2));

  // =====================================================
  // IS THUMB RULE CALCULATION ENGINE
  // =====================================================

  const calculateWoodQty = (item: ItemType) => {

    // ------------------------------------------
    // FRAME CALCULATION
    // Formula:
    // Running Length × Width × Depth
    // ------------------------------------------

    const runningLength =
      ((2 * item.height) + item.width) * item.qty;

    const secWidthFt = mmToFt(item.secWidth);

    const secDepthFt = mmToFt(item.secDepth);

    const frameWood =
      runningLength *
      secWidthFt *
      secDepthFt;

    // ------------------------------------------
    // SHUTTER CALCULATION
    // Formula:
    // Width × Height × Thickness
    // ------------------------------------------

    const shutterThicknessFt =
      mmToFt(item.shutterThickness);

    const shutterWood =
      item.width *
      item.height *
      item.qty *
      item.shutters *
      shutterThicknessFt;

    // ------------------------------------------
    // THUMB RULE EXTRA FACTOR
    // (Cutting / wastage / joints)
    // 8%
    // ------------------------------------------

    const total =
      (frameWood + shutterWood) * 1.08;

    return {
      frameWood: round2(frameWood),
      shutterWood: round2(shutterWood),
      totalWood: round2(total),
    };
  };

  // =====================================================
  // GENERATE BOQ
  // =====================================================

  const generateBOQ = () => {

    let items: BOQItem[] = [];

    let totalWoodQty = 0;

    // =====================================================
    // DOORS
    // =====================================================

    doors.forEach((d) => {

      const calc = calculateWoodQty(d);

      totalWoodQty += calc.totalWood;

      const woodRate = woodRates[d.wood];

      items.push({
        item: `${d.name} Frame Wood`,
        qty: calc.frameWood,
        unit: "cft",
        rate: woodRate,
        amount: calc.frameWood * woodRate,
      });

      items.push({
        item: `${d.name} Shutter Wood`,
        qty: calc.shutterWood,
        unit: "cft",
        rate: woodRate,
        amount: calc.shutterWood * woodRate,
      });

      items.push({
        item: `${d.name} Hardware Set`,
        qty: d.qty,
        unit: "set",
        rate: 1800,
        amount: d.qty * 1800,
      });

      items.push({
        item: `${d.name} Door Lock`,
        qty: d.qty,
        unit: "nos",
        rate: 350,
        amount: d.qty * 350,
      });

      items.push({
        item: `${d.name} Hinges`,
        qty: d.qty * 3,
        unit: "nos",
        rate: 60,
        amount: d.qty * 3 * 60,
      });

      items.push({
        item: `${d.name} Tower Bolt`,
        qty: d.qty * 2,
        unit: "nos",
        rate: 120,
        amount: d.qty * 2 * 120,
      });

      items.push({
        item: `${d.name} Handle`,
        qty: d.qty,
        unit: "nos",
        rate: 180,
        amount: d.qty * 180,
      });

      items.push({
        item: `${d.name} Polish/Paint`,
        qty: round2(d.width * d.height * d.qty),
        unit: "sqft",
        rate: 45,
        amount: d.width * d.height * d.qty * 45,
      });

    });

    // =====================================================
    // WINDOWS
    // =====================================================

    windows.forEach((w) => {

      const calc = calculateWoodQty(w);

      totalWoodQty += calc.totalWood;

      const woodRate = woodRates[w.wood];

      items.push({
        item: `${w.name} Window Wood`,
        qty: calc.totalWood,
        unit: "cft",
        rate: woodRate,
        amount: calc.totalWood * woodRate,
      });

      items.push({
        item: `${w.name} Glass`,
        qty: round2(w.width * w.height * w.qty),
        unit: "sqft",
        rate: 180,
        amount:
          w.width *
          w.height *
          w.qty *
          180,
      });

      items.push({
        item: `${w.name} Window Hardware`,
        qty: w.qty,
        unit: "set",
        rate: 950,
        amount: w.qty * 950,
      });

      items.push({
        item: `${w.name} Mesh`,
        qty: round2(w.width * w.height * w.qty),
        unit: "sqft",
        rate: 35,
        amount:
          w.width *
          w.height *
          w.qty *
          35,
      });

    });

    // =====================================================
    // VENTILATORS
    // =====================================================

    vents.forEach((v) => {

      const calc = calculateWoodQty(v);

      totalWoodQty += calc.totalWood;

      const woodRate = woodRates[v.wood];

      items.push({
        item: `${v.name} Ventilator Wood`,
        qty: calc.totalWood,
        unit: "cft",
        rate: woodRate,
        amount: calc.totalWood * woodRate,
      });

      items.push({
        item: `${v.name} Glass`,
        qty: round2(v.width * v.height * v.qty),
        unit: "sqft",
        rate: 150,
        amount:
          v.width *
          v.height *
          v.qty *
          150,
      });

    });

    // =====================================================
    // COMMON MATERIALS
    // =====================================================

    items.push({
      item: "Fevicol Adhesive",
      qty: 2,
      unit: "kg",
      rate: 250,
      amount: 500,
    });

    items.push({
      item: "Wood Screws",
      qty: 3,
      unit: "box",
      rate: 180,
      amount: 540,
    });

    items.push({
      item: "Sand Paper",
      qty: 10,
      unit: "nos",
      rate: 25,
      amount: 250,
    });

    items.push({
      item: "Wood Wastage",
      qty: "8%",
      unit: "",
      rate: 0,
      amount: totalWoodQty * 250,
    });

    // =====================================================
    // TOTAL
    // =====================================================

    const totalAmount =
      items.reduce(
        (sum, item) => sum + item.amount,
        0
      );

    setBOQ(items);

    setTotalWood(round2(totalWoodQty));

    setGrandTotal(round2(totalAmount));
  };

  // =====================================================
  // CSV EXPORT
  // =====================================================

  const exportCSV = () => {

    const rows = [
      [
        "Item",
        "Qty",
        "Unit",
        "Rate",
        "Amount",
      ],
    ];

    boq.forEach((b) => {
      rows.push([
        b.item,
        String(b.qty),
        b.unit,
        String(b.rate),
        String(b.amount),
      ]);
    });

    const csv =
      rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "doors_windows_boq.csv";

    a.click();
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        <h1 className="text-3xl font-bold mb-6">
          🚪 Doors & Windows Calculator
        </h1>

        {/* SUMMARY */}

        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="bg-green-100 p-4 rounded-xl">
            <div className="text-lg font-bold">
              Total Wood
            </div>

            <div className="text-3xl font-bold text-green-700">
              {totalWood} cft
            </div>
          </div>

          <div className="bg-blue-100 p-4 rounded-xl">
            <div className="text-lg font-bold">
              Total BOQ Items
            </div>

            <div className="text-3xl font-bold text-blue-700">
              {boq.length}
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded-xl">
            <div className="text-lg font-bold">
              Grand Total
            </div>

            <div className="text-3xl font-bold text-yellow-700">
              ₹ {grandTotal.toLocaleString()}
            </div>
          </div>

        </div>

        {/* BUTTONS */}

        <div className="flex gap-4 mb-8 flex-wrap">

          <button
            onClick={generateBOQ}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            📊 Generate BOQ
          </button>

          <button
            onClick={exportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            📎 Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            🖨️ Print
          </button>

        </div>

        {/* BOQ TABLE */}

        <div className="overflow-auto">

          <table className="w-full border-collapse border">

            <thead className="bg-gray-200">

              <tr>
                <th className="border p-3 text-left">
                  Item
                </th>

                <th className="border p-3">
                  Qty
                </th>

                <th className="border p-3">
                  Unit
                </th>

                <th className="border p-3">
                  Rate
                </th>

                <th className="border p-3">
                  Amount
                </th>
              </tr>

            </thead>

            <tbody>

              {boq.map((b, idx) => (

                <tr
                  key={idx}
                  className="hover:bg-gray-50"
                >

                  <td className="border p-2">
                    {b.item}
                  </td>

                  <td className="border p-2 text-center">
                    {b.qty}
                  </td>

                  <td className="border p-2 text-center">
                    {b.unit}
                  </td>

                  <td className="border p-2 text-center">
                    ₹ {b.rate}
                  </td>

                  <td className="border p-2 text-right">
                    ₹ {b.amount.toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default DoorsWindowsCalc;