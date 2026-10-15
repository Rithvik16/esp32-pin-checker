import { useMemo, useState, type FormEvent } from "react";
const boardAsset = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/457747668463153152/457769772306829312/44326d13b19675ce4c50b996f5566599e6ab3250071a10449257aab21e2f2a62.png";
import "./ESP32PinChecker.css";
type Purpose = "sensor" | "output" | "interrupt" | "pullup" | "pulldown" | "analog";
type Status = "compatible" | "caution" | "blocked";
type BoardId = "doit-v1" | "devkitc-v4" | "s3-devkitc-1" | "c3-devkitm-1";
type Family = "classic" | "s3" | "c3";
type Pin = {
  gpio: number | null;
  label: string;
  side: "left" | "right";
  kind: "gpio" | "power" | "control";
};
type Assessment = {
  status: Status;
  title: string;
  reason: string;
  note?: string;
};
type BoardProfile = {
  id: BoardId;
  name: string;
  shortName: string;
  maker: string;
  family: Family;
  module: string;
  detail: string;
  left: Array<number | string>;
  right: Array<number | string>;
  adc: Record<number, string>;
  straps: number[];
  inputOnly: number[];
  noPull: number[];
  reserved: number[];
  uart: Record<number, string>;
  special: Record<number, string>;
  guideUrl: string;
  footerNote: string;
};
const CLASSIC_ADC: Record<number, string> = {
  0: "ADC2_CH1",
  2: "ADC2_CH2",
  4: "ADC2_CH0",
  12: "ADC2_CH5",
  13: "ADC2_CH4",
  14: "ADC2_CH6",
  15: "ADC2_CH3",
  25: "ADC2_CH8",
  26: "ADC2_CH9",
  27: "ADC2_CH7",
  32: "ADC1_CH4",
  33: "ADC1_CH5",
  34: "ADC1_CH6",
  35: "ADC1_CH7",
  36: "ADC1_CH0",
  39: "ADC1_CH3"
};
const CLASSIC_LEFT = ["3V3", "EN", 36, 39, 34, 35, 32, 33, 25, 26, 27, 14, 12, "GND", 13];
const CLASSIC_RIGHT = ["GND", 23, 22, 1, 3, 21, 19, 18, 5, 17, 16, 4, 0, 2, 15];
const DEVKITC_LEFT = ["3V3", "EN", 36, 39, 34, 35, 32, 33, 25, 26, 27, 14, 12, "GND", 13, 9, 10, 11, "5V"];
const DEVKITC_RIGHT = ["GND", 23, 22, 1, 3, 21, "GND", 19, 18, 5, 17, 16, 4, 0, 2, 15, 8, 7, 6];
const S3_LEFT = ["3V3", "3V3", "RST", 4, 5, 6, 7, 15, 16, 17, 18, 8, 3, 46, 9, 10, 11, 12, 13, 14, "5V", "GND"];
const S3_RIGHT = ["GND", 43, 44, 1, 2, 42, 41, 40, 39, 38, 37, 36, 35, 0, 45, 48, 47, 21, 20, 19, "GND", "GND"];
const C3_LEFT = ["GND", "3V3", "3V3", 2, 3, "GND", "RST", "GND", 0, 1, 10, "GND", "5V", "5V", "GND"];
const C3_RIGHT = ["GND", 21, 20, "GND", 9, 8, "GND", 7, 6, 5, 4, "GND", 18, 19, "GND"];
const BOARD_PROFILES: BoardProfile[] = [{
  id: "doit-v1",
  name: "ESP32 DevKit V1",
  shortName: "DevKit V1",
  maker: "DOIT / compatible",
  family: "classic",
  module: "ESP-WROOM-32",
  detail: "Classic ESP32 · 30-pin layout",
  left: CLASSIC_LEFT,
  right: CLASSIC_RIGHT,
  adc: CLASSIC_ADC,
  straps: [0, 2, 5, 12, 15],
  inputOnly: [34, 35, 36, 39],
  noPull: [34, 35, 36, 39],
  reserved: [6, 7, 8, 9, 10, 11],
  uart: {
    1: "UART0 TX",
    3: "UART0 RX"
  },
  special: {},
  guideUrl: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html",
  footerNote: "30-pin DevKit V1 reference. Match GPIO labels to your board; compatible layouts can vary."
}, {
  id: "devkitc-v4",
  name: "ESP32-DevKitC V4",
  shortName: "DevKitC V4",
  maker: "Espressif",
  family: "classic",
  module: "ESP32-WROOM-32E",
  detail: "Classic ESP32 · 38-pin layout",
  left: DEVKITC_LEFT,
  right: DEVKITC_RIGHT,
  adc: CLASSIC_ADC,
  straps: [0, 2, 5, 12, 15],
  inputOnly: [34, 35, 36, 39],
  noPull: [34, 35, 36, 39],
  reserved: [6, 7, 8, 9, 10, 11],
  uart: {
    1: "UART0 TX",
    3: "UART0 RX"
  },
  special: {},
  guideUrl: "https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html",
  footerNote: "Profile uses the ESP32-WROOM-32E option. GPIO6–11 are used for module flash; avoid them."
}, {
  id: "s3-devkitc-1",
  name: "ESP32-S3-DevKitC-1",
  shortName: "S3 DevKitC-1",
  maker: "Espressif",
  family: "s3",
  module: "ESP32-S3-WROOM-1-N8",
  detail: "ESP32-S3 · 44-pin layout",
  left: S3_LEFT,
  right: S3_RIGHT,
  adc: {
    1: "ADC1_CH0",
    2: "ADC1_CH1",
    3: "ADC1_CH2",
    4: "ADC1_CH3",
    5: "ADC1_CH4",
    6: "ADC1_CH5",
    7: "ADC1_CH6",
    8: "ADC1_CH7",
    9: "ADC1_CH8",
    10: "ADC1_CH9",
    11: "ADC2_CH0",
    12: "ADC2_CH1",
    13: "ADC2_CH2",
    14: "ADC2_CH3",
    15: "ADC2_CH4",
    16: "ADC2_CH5",
    17: "ADC2_CH6",
    18: "ADC2_CH7",
    19: "ADC2_CH8",
    20: "ADC2_CH9"
  },
  straps: [0, 3, 45, 46],
  inputOnly: [46],
  noPull: [46],
  reserved: [],
  uart: {
    43: "UART0 TX",
    44: "UART0 RX"
  },
  special: {
    19: "Also used for native USB",
    20: "Also used for native USB",
    38: "On-board RGB LED"
  },
  guideUrl: "https://docs.espressif.com/projects/esp-idf/en/v5.0/esp32s3/hw-reference/esp32s3/user-guide-devkitc-1.html",
  footerNote: "Profile uses the WROOM-1 module. WROOM-2 variants can reserve GPIO35–37 for flash/PSRAM."
}, {
  id: "c3-devkitm-1",
  name: "ESP32-C3-DevKitM-1",
  shortName: "C3 DevKitM-1",
  maker: "Espressif",
  family: "c3",
  module: "ESP32-C3-MINI-1",
  detail: "ESP32-C3 · 30-pin layout",
  left: C3_LEFT,
  right: C3_RIGHT,
  adc: {
    0: "ADC1_CH0",
    1: "ADC1_CH1",
    2: "ADC1_CH2",
    3: "ADC1_CH3",
    4: "ADC1_CH4",
    5: "ADC2_CH0"
  },
  straps: [2, 8, 9],
  inputOnly: [],
  noPull: [],
  reserved: [11, 12, 13, 14, 15, 16, 17],
  uart: {
    20: "UART0 RX",
    21: "UART0 TX"
  },
  special: {
    8: "On-board RGB LED",
    18: "Also used for USB / JTAG",
    19: "Also used for USB / JTAG"
  },
  guideUrl: "https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitm-1/user_guide.html",
  footerNote: "GPIO8 drives the on-board RGB LED. GPIO18/19 are assigned to USB-JTAG by default."
}];
const PURPOSE_OPTIONS: Array<{
  value: Purpose;
  label: string;
  detail: string;
}> = [{
  value: "sensor",
  label: "Digital sensor",
  detail: "Switches and signal inputs"
}, {
  value: "output",
  label: "Digital output",
  detail: "LEDs and control signals"
}, {
  value: "interrupt",
  label: "Interrupt",
  detail: "Detect an edge or pulse"
}, {
  value: "analog",
  label: "Analog input",
  detail: "Read a sensor voltage"
}, {
  value: "pullup",
  label: "Pull-up",
  detail: "Button with an idle HIGH"
}, {
  value: "pulldown",
  label: "Pull-down",
  detail: "Button with an idle LOW"
}];
function makeRail(values: Array<number | string>, side: "left" | "right"): Pin[] {
  return values.map(value => typeof value === "number" ? {
    gpio: value,
    label: `GPIO${value}`,
    side,
    kind: "gpio"
  } : {
    gpio: null,
    label: value,
    side,
    kind: value === "EN" || value === "RST" ? "control" : "power"
  });
}
function getRails(board: BoardProfile) {
  const left = makeRail(board.left, "left");
  const right = makeRail(board.right, "right");
  const gpioPins = [...left, ...right].filter(pin => pin.gpio !== null) as Array<Pin & {
    gpio: number;
  }>;
  return {
    left,
    right,
    gpioPins
  };
}
function recommendationOrder(board: BoardProfile, purpose: Purpose): number[] {
  if (board.family === "s3") {
    if (purpose === "analog") return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    if (purpose === "output") return [4, 5, 6, 7, 8, 9, 10, 21, 38, 47, 48, 39, 40, 41, 42, 18, 17, 16, 15, 14, 13, 12, 11, 20, 19, 1, 2];
    if (purpose === "interrupt") return [4, 5, 6, 7, 8, 9, 10, 21, 38, 47, 48, 39, 40, 41, 42, 18, 17, 16, 15, 14, 13, 12, 11, 20, 19, 1, 2, 46];
    return [4, 5, 6, 7, 8, 9, 10, 21, 38, 47, 48, 39, 40, 41, 42, 18, 17, 16, 15, 14, 13, 12, 11, 20, 19, 1, 2];
  }
  if (board.family === "c3") {
    if (purpose === "analog") return [0, 1, 2, 3, 4, 5];
    if (purpose === "output") return [4, 5, 6, 7, 10, 1, 0, 3, 20, 21, 18, 19, 2, 8, 9];
    return [4, 3, 1, 0, 6, 7, 10, 20, 21, 18, 19, 5, 2, 8, 9];
  }
  if (purpose === "sensor") return [34, 35, 32, 33, 21, 22, 19, 18, 23, 25, 26, 27, 14, 13, 16, 17, 4];
  if (purpose === "analog") return [32, 33, 34, 35, 36, 39, 25, 26, 27, 4, 0, 2, 12, 13, 14, 15];
  if (purpose === "output") return [25, 26, 27, 32, 33, 16, 17, 18, 19, 21, 22, 23, 4, 13, 14];
  if (purpose === "interrupt") return [32, 33, 25, 26, 27, 16, 17, 18, 19, 21, 22, 23, 4, 34, 35, 13, 14];
  return [32, 33, 25, 26, 27, 16, 17, 18, 19, 21, 22, 23, 4, 13, 14];
}
function assessPin(pin: Pin, purpose: Purpose, board: BoardProfile): Assessment {
  const gpio = pin.gpio;
  if (gpio === null) return {
    status: "blocked",
    title: "Not a GPIO",
    reason: `${pin.label} is a power or reset pin, so it cannot be used as a GPIO signal.`
  };
  if (board.reserved.includes(gpio)) return {
    status: "blocked",
    title: "Reserved for flash",
    reason: `GPIO${gpio} is reserved for the module’s flash memory. Choose another pin.`
  };
  const inputOnly = board.inputOnly.includes(gpio);
  const noPull = board.noPull.includes(gpio);
  const adcChannel = board.adc[gpio];
  const isAdc2 = Boolean(adcChannel?.startsWith("ADC2"));
  let result: Assessment;
  if (purpose === "sensor") {
    result = {
      status: "compatible",
      title: "Compatible",
      reason: inputOnly ? `GPIO${gpio} is input-only${adcChannel ? ` and supports ${adcChannel}` : ""}, so it can read a sensor signal. It has no internal pull-up or pull-down; add an external resistor if needed.` : `GPIO${gpio} can read a digital sensor signal. Keep the signal within the board’s 3.3 V logic range.`
    };
  } else if (purpose === "output") {
    result = inputOnly ? {
      status: "blocked",
      title: "Not suitable",
      reason: `GPIO${gpio} is input-only, so it cannot drive an output.`
    } : {
      status: "compatible",
      title: "Compatible",
      reason: `GPIO${gpio} supports digital output. Keep connected loads within the pin’s electrical limits.`
    };
  } else if (purpose === "interrupt") {
    const limited = board.family === "classic" && (gpio === 36 || gpio === 39);
    result = {
      status: limited ? "caution" : "compatible",
      title: limited ? "Use with caution" : "Compatible",
      reason: limited ? `GPIO${gpio} can signal an interrupt, but Espressif documents a limitation when ADC or Wi-Fi/Bluetooth sleep features are used.` : `GPIO${gpio} can be used as a digital input and supports GPIO interrupts.`
    };
  } else if (purpose === "pullup" || purpose === "pulldown") {
    const pullLabel = purpose === "pullup" ? "pull-up" : "pull-down";
    result = noPull ? {
      status: "blocked",
      title: "Not suitable",
      reason: `GPIO${gpio} has no internal pull resistor. Use an external ${pullLabel} resistor if your circuit needs one.`
    } : {
      status: "compatible",
      title: "Compatible",
      reason: `GPIO${gpio} supports an internal ${pullLabel}, configured in software.`
    };
  } else {
    result = !adcChannel ? {
      status: "blocked",
      title: "Not suitable",
      reason: `GPIO${gpio} has no ADC channel, so it cannot read an analog value directly.`
    } : isAdc2 ? {
      status: "caution",
      title: "Use with caution",
      reason: `GPIO${gpio} supports ${adcChannel}, but ADC2 readings can conflict with Wi-Fi. Prefer an ADC1 pin when Wi-Fi is active.`
    } : {
      status: "compatible",
      title: "Compatible",
      reason: `GPIO${gpio} supports ${adcChannel}, suitable for analog sensor readings.`
    };
  }
  if (board.straps.includes(gpio)) {
    result = {
      ...result,
      status: result.status === "blocked" ? "blocked" : "caution",
      title: result.status === "blocked" ? result.title : "Use with caution",
      reason: result.status === "blocked" ? result.reason : `${result.reason} This is a boot-strapping pin; keep attached circuitry from changing its sampled level during reset.`,
      note: `GPIO${gpio} is sampled during boot. Check the board’s reset-level requirements before connecting external circuitry.`
    };
  }
  if (board.uart[gpio] && result.status === "compatible") {
    result = {
      ...result,
      status: "caution",
      title: "Use with caution",
      reason: `${result.reason} It is also used for ${board.uart[gpio]} during flashing or serial logs.`
    };
  }
  if (board.special[gpio] && result.status === "compatible") {
    result = {
      ...result,
      status: "caution",
      title: "Use with caution",
      reason: `${result.reason} ${board.special[gpio]}.`
    };
  }
  return result;
}
function featuresFor(pin: Pin, board: BoardProfile): string[] {
  if (pin.gpio === null) return [pin.kind === "control" ? "Reset / enable" : "Power rail"];
  const gpio = pin.gpio;
  const features: string[] = [];
  if (board.reserved.includes(gpio)) features.push("FLASH RESERVED");
  if (board.inputOnly.includes(gpio)) features.push("INPUT ONLY");
  if (board.adc[gpio]) features.push(board.adc[gpio]);
  if (board.straps.includes(gpio)) features.push("BOOT STRAP");
  if (board.uart[gpio]) features.push(board.uart[gpio]);
  if (board.special[gpio]) features.push("BOARD FUNCTION");
  if (!features.length) features.push("DIGITAL I/O");
  return features;
}
function pinBadges(pin: Pin, board: BoardProfile): string[] {
  if (pin.gpio === null) return [pin.kind === "control" ? "Reset / enable" : "Power rail"];
  const gpio = pin.gpio;
  const badges: string[] = [];
  if (board.reserved.includes(gpio)) badges.push("Flash reserved");
  if (board.inputOnly.includes(gpio)) badges.push("Input only");
  if (board.adc[gpio]) badges.push(board.adc[gpio]);
  if (board.straps.includes(gpio)) badges.push("Boot strapping");
  if (board.uart[gpio]) badges.push(board.uart[gpio]);
  if (board.special[gpio]) badges.push(board.special[gpio]);
  if (!badges.length) badges.push("Digital I/O");
  return badges;
}
function PinRail({
  side,
  pins,
  selectedGpio,
  purpose,
  board,
  onSelect
}: {
  side: "left" | "right";
  pins: Pin[];
  selectedGpio: number;
  purpose: Purpose;
  board: BoardProfile;
  onSelect: (gpio: number) => void;
}) {
  return <div className={`pin-rail pin-rail-${side}`} style={{
    gridTemplateRows: `repeat(${pins.length}, 22px)`
  }} aria-label={`${side} side pins`}>
    {pins.map((pin, index) => {
      const isGpio = pin.gpio !== null;
      const isSelected = pin.gpio === selectedGpio;
      const status = isGpio ? assessPin(pin, purpose, board) : null;
      const features = featuresFor(pin, board);
      const classes = ["pin-row", isSelected ? "is-selected" : "", isGpio ? "" : "is-non-gpio", pin.gpio !== null && board.straps.includes(pin.gpio) ? "is-strapping" : "", pin.gpio !== null && board.reserved.includes(pin.gpio) ? "is-reserved" : ""].filter(Boolean).join(" ");
      return <button className={classes} key={`${side}-${index}`} type="button" disabled={!isGpio} aria-pressed={isSelected} aria-label={`${pin.label}, ${features.join(", ")}`} onClick={() => pin.gpio !== null && onSelect(pin.gpio)}>
        <span className="pin-feature">{features.slice(0, 2).join(" · ")}</span>
        <span className="pin-name">{pin.label}</span>
        {status ? <span className={`compat-dot dot-${status.status}`} aria-hidden="true" /> : <span className="rail-mark" />}
      </button>;
    })}
  </div>;
}
function identifyBoardFromLink(value: string): {
  id: BoardId;
  clue: string;
} | null {
  let text = value.toLowerCase();
  try {
    text = decodeURIComponent(text);
  } catch {/* Keep matching the raw URL when a segment is encoded unusually. */}
  if (/esp32[-_ ]?s3|s3[-_ ]?devkitc|s3[-_ ]?wroom/.test(text)) return {
    id: "s3-devkitc-1",
    clue: "ESP32-S3"
  };
  if (/esp32[-_ ]?c3|c3[-_ ]?devkitm|c3[-_ ]?mini/.test(text)) return {
    id: "c3-devkitm-1",
    clue: "ESP32-C3"
  };
  if (/devkitc[-_ ]?v?4|esp32[-_ ]?devkitc/.test(text)) return {
    id: "devkitc-v4",
    clue: "DevKitC V4"
  };
  if (/doit|devkit[-_ ]?v?1|esp32[-_ ]?devkit[-_ ]?v?1/.test(text)) return {
    id: "doit-v1",
    clue: "DevKit V1"
  };
  return null;
}
export const ESP32PinChecker = () => {
  const [boardId, setBoardId] = useState<BoardId>("doit-v1");
  const [selectedGpio, setSelectedGpio] = useState(34);
  const [purpose, setPurpose] = useState<Purpose>("sensor");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [boardLibraryOpen, setBoardLibraryOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [linkFallbackOpen, setLinkFallbackOpen] = useState(false);
  const [sourceKind, setSourceKind] = useState<"product" | "datasheet">("product");
  const [linkValue, setLinkValue] = useState("");
  const [savedSource, setSavedSource] = useState("");
  const [lookupMessage, setLookupMessage] = useState<{
    kind: "success" | "neutral" | "error";
    title: string;
    body: string;
  } | null>(null);
  const board = BOARD_PROFILES.find(profile => profile.id === boardId) ?? BOARD_PROFILES[0];
  const {
    left,
    right,
    gpioPins
  } = useMemo(() => getRails(board), [board]);
  const purposeOption = PURPOSE_OPTIONS.find(option => option.value === purpose)!;
  const boardGroups = useMemo(() => {
    const query = boardSearch.trim().toLowerCase();
    const filtered = BOARD_PROFILES.filter(profile => {
      const familyLabel = profile.family === "classic" ? "esp32 esp32-wroom" : `esp32-${profile.family}`;
      const searchable = `${profile.name} ${profile.shortName} ${profile.maker} ${profile.module} ${profile.detail} ${familyLabel}`.toLowerCase();
      return !query || searchable.includes(query);
    });
    return [...new Set(filtered.map(profile => profile.maker))].map(maker => ({
      maker,
      profiles: filtered.filter(profile => profile.maker === maker)
    }));
  }, [boardSearch]);
  const selectedPin = gpioPins.find(pin => pin.gpio === selectedGpio) ?? gpioPins[0];
  const assessment = assessPin(selectedPin, purpose, board);
  const badges = pinBadges(selectedPin, board);
  const adcChannel = selectedPin.gpio === null ? undefined : board.adc[selectedPin.gpio];
  const isInputOnly = selectedPin.gpio !== null && board.inputOnly.includes(selectedPin.gpio);
  const noPull = selectedPin.gpio !== null && board.noPull.includes(selectedPin.gpio);
  const recommendedPins = recommendationOrder(board, purpose).reduce<Array<Pin & {
    gpio: number;
  }>>((matches, gpio) => {
    const pin = gpioPins.find(candidate => candidate.gpio === gpio);
    if (pin && assessPin(pin, purpose, board).status !== "blocked") matches.push(pin);
    return matches;
  }, []).slice(0, 3);
  const rowCount = Math.max(left.length, right.length);
  function selectBoard(nextId: BoardId) {
    const nextBoard = BOARD_PROFILES.find(profile => profile.id === nextId) ?? BOARD_PROFILES[0];
    const rails = getRails(nextBoard);
    const firstRecommended = recommendationOrder(nextBoard, purpose).find(gpio => rails.gpioPins.some(pin => pin.gpio === gpio));
    setBoardId(nextId);
    if (firstRecommended !== undefined) setSelectedGpio(firstRecommended);
    setBoardLibraryOpen(false);
    setBoardSearch("");
    setLinkFallbackOpen(false);
    setLookupMessage(null);
  }
  function handleLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let parsed: URL;
    try {
      parsed = new URL(linkValue.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Use a web link that starts with http or https.");
    } catch {
      setLookupMessage({
        kind: "error",
        title: "Enter a valid web link",
        body: "Paste the full purchase or datasheet URL, including https://."
      });
      return;
    }
    setSavedSource(parsed.href);
    setLinkFallbackOpen(true);
    const match = identifyBoardFromLink(parsed.href);
    if (match) {
      setBoardSearch(match.clue);
      setLookupMessage({
        kind: "neutral",
        title: `${match.clue} clue in the URL · not verified`,
        body: "This narrows the catalog only. Confirm the exact board and module before using its pin map."
      });
      setBoardLibraryOpen(true);
    } else {
      setBoardSearch("");
      setLookupMessage({
        kind: "neutral",
        title: "Link saved · model not identified",
        body: "No model clue was found in the URL. Search the catalog or confirm the exact board profile manually."
      });
      setBoardLibraryOpen(true);
    }
  }
  function resetChecker() {
    selectBoard("doit-v1");
    setSelectedGpio(34);
    setPurpose("sensor");
    setBrowseOpen(false);
    setBoardLibraryOpen(false);
    setBoardSearch("");
    setLinkFallbackOpen(false);
    setLinkValue("");
    setSavedSource("");
    setLookupMessage(null);
  }
  return <div className="esp32-app">
    <header className="app-header">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden="true">P</span>
        <div><h1>Pinout</h1><p>ESP32 pin checker</p></div>
      </div>
      <div className="header-actions">
        <button className="board-chip" type="button" aria-expanded={boardLibraryOpen} onClick={() => setBoardLibraryOpen(open => !open)}>
          {board.shortName}<span>Change</span>
        </button>
        <a href={board.guideUrl} target="_blank" rel="noreferrer">Board guide <span aria-hidden="true">↗</span></a>
      </div>
    </header>

    <main className="home-layout">
      <section className="intro-block" aria-labelledby="page-title">
        <span className="eyebrow intro-eyebrow"><span className="live-dot" /> ESP32 · GPIO CHECKER</span>
        <h2 id="page-title">Find the right pin.</h2>
        <p>Choose your board and task. Get a short list of pins that fit.</p>
      </section>

      <section className="board-setup" aria-labelledby="board-setup-title">
        <div className="board-setup-heading">
          <div>
            <span className="eyebrow">BOARD PROFILE</span>
            <h3 id="board-setup-title">{board.name}</h3>
            <p>{board.maker} <span>·</span> {board.module}</p>
          </div>
          <span className="board-confirmed"><span aria-hidden="true">!</span> Match your board label</span>
        </div>

        <div className="board-catalog">
          <button className="board-select-trigger" type="button" aria-expanded={boardLibraryOpen} aria-controls="board-catalog-panel" onClick={() => {
            setBoardLibraryOpen(open => !open);
            setLinkFallbackOpen(false);
          }}>
            <span className="catalog-search-icon" aria-hidden="true">⌕</span>
            <span className="board-select-copy"><small>SELECTED BOARD</small><strong>{board.name}</strong><em>{board.maker} · {board.module}</em></span>
            <span className="catalog-count">{BOARD_PROFILES.length} profiles <b aria-hidden="true">{boardLibraryOpen ? "⌃" : "⌄"}</b></span>
          </button>

          {boardLibraryOpen && <div className="board-catalog-popover" id="board-catalog-panel">
            <label className="board-search-label" htmlFor="board-search">SEARCH BOARDS</label>
            <div className="board-search-wrap"><span aria-hidden="true">⌕</span><input id="board-search" type="search" value={boardSearch} onChange={event => setBoardSearch(event.currentTarget.value)} placeholder="Try ESP32-S3, WROOM, or DevKitC…" autoComplete="off" /></div>
            <div className="board-library" role="listbox" aria-label="Supported ESP32 boards">
              {boardGroups.map(group => <section className="board-group" key={group.maker}>
                <div className="board-group-heading"><span>{group.maker}</span><small>{group.profiles.length} {group.profiles.length === 1 ? "board" : "boards"}</small></div>
                {group.profiles.map(profile => <button className={`board-profile ${profile.id === boardId ? "is-selected" : ""}`} key={profile.id} type="button" role="option" aria-selected={profile.id === boardId} onClick={() => selectBoard(profile.id)}>
                  <span className="profile-copy"><strong>{profile.name}</strong><small>{profile.module} · {profile.detail}</small></span>
                  <span className="profile-check" aria-hidden="true">{profile.id === boardId ? "✓" : "→"}</span>
                </button>)}
              </section>)}
              {boardGroups.length === 0 && <p className="board-empty">No match yet. Try the chip family or module name.</p>}
            </div>

            <button className="link-fallback-toggle" type="button" aria-expanded={linkFallbackOpen} onClick={() => setLinkFallbackOpen(open => !open)}>
              <span>Can’t find your board?</span><strong>{linkFallbackOpen ? "Hide link options" : "Add a product or datasheet link"}</strong>
            </button>
            {linkFallbackOpen && <div className="link-fallback">
              <div className="source-tabs" role="group" aria-label="Link type">
                <button className={sourceKind === "product" ? "is-active" : ""} type="button" aria-pressed={sourceKind === "product"} onClick={() => setSourceKind("product")}>Product link</button>
                <button className={sourceKind === "datasheet" ? "is-active" : ""} type="button" aria-pressed={sourceKind === "datasheet"} onClick={() => setSourceKind("datasheet")}>Datasheet</button>
              </div>
              <form className="board-link-form" onSubmit={handleLinkSubmit}>
                <label className="sr-only" htmlFor="board-link">{sourceKind === "product" ? "ESP32 product purchase link" : "ESP32 datasheet link"}</label>
                <input id="board-link" type="url" value={linkValue} onChange={event => setLinkValue(event.currentTarget.value)} placeholder={sourceKind === "product" ? "Paste a store or purchase link…" : "Paste an Espressif datasheet link…"} aria-describedby="link-help" />
                <button type="submit">Check link <span aria-hidden="true">→</span></button>
              </form>
              <p className="link-help" id="link-help">Links currently narrow the catalog using URL text; confirm the exact board profile before checking pins.</p>
            </div>}
          </div>}
        </div>

        <div className="board-verification-note" role="note">
          <span aria-hidden="true">!</span>
          <p><strong>Before wiring:</strong> match the module marking and GPIO labels on your board to this profile. Clones and revisions can differ.</p>
        </div>

        {savedSource && <div className="saved-source"><span>REFERENCE LINK</span><a href={savedSource} target="_blank" rel="noreferrer">{new URL(savedSource).hostname} <span aria-hidden="true">↗</span></a></div>}
        {lookupMessage && <div className={`lookup-message lookup-${lookupMessage.kind}`} role={lookupMessage.kind === "error" ? "alert" : "status"}>
          <span className="lookup-icon" aria-hidden="true">{lookupMessage.kind === "success" ? "✓" : lookupMessage.kind === "error" ? "!" : "↗"}</span>
          <div><strong>{lookupMessage.title}</strong><p>{lookupMessage.body}</p></div>
        </div>}
      </section>

      <section className="purpose-section" aria-labelledby="purpose-title">
        <div className="section-heading">
          <div><span className="eyebrow step-eyebrow">CHOOSE A TASK</span><h3 id="purpose-title">What are you connecting?</h3></div>
          <span>Using {board.shortName}</span>
        </div>
        <div className="purpose-grid">
          {PURPOSE_OPTIONS.map((option, index) => <button className={`purpose-option ${purpose === option.value ? "is-active" : ""}`} key={option.value} type="button" aria-pressed={purpose === option.value} onClick={() => {
            setPurpose(option.value);
            const firstPin = recommendationOrder(board, option.value).find(gpio => gpioPins.some(pin => pin.gpio === gpio));
            if (firstPin !== undefined) setSelectedGpio(firstPin);
          }}>
            <span className="purpose-index">0{index + 1}</span>
            <span className="purpose-copy"><strong>{option.label}</strong><small>{option.detail}</small></span>
            <span className="purpose-arrow" aria-hidden="true">↗</span>
          </button>)}
        </div>
      </section>

      <section className="recommendations" aria-labelledby="recommend-title">
        <div className="recommend-heading">
          <div><span className="eyebrow">PIN PICKS</span><h3 id="recommend-title">Best pins for {purposeOption.label.toLowerCase()}</h3></div>
          <span className="auto-tag"><span className="sparkle" aria-hidden="true">✳</span> {board.shortName}</span>
        </div>
        <div className="recommend-grid">
          {recommendedPins.map((pin, index) => {
            const gpio = pin.gpio!;
            const isSelected = gpio === selectedGpio;
            const pinAssessment = assessPin(pin, purpose, board);
            const highlight = board.inputOnly.includes(gpio) ? "Input only" : board.adc[gpio]?.startsWith("ADC1") ? board.adc[gpio] : "Digital I/O";
            return <button className={`recommend-card ${isSelected ? "is-selected" : ""}`} key={gpio} type="button" aria-pressed={isSelected} onClick={() => setSelectedGpio(gpio)}>
              <span className="recommend-card-top"><span className="recommend-index">{index === 0 ? "BEST MATCH" : "ALSO WORKS"}</span><span className={`tiny-status dot-${pinAssessment.status}`} aria-hidden="true" /></span>
              <span className="recommend-card-main"><strong>GPIO {gpio}</strong><span className="recommend-meta">{highlight}</span></span>
              <span className="recommend-card-foot"><span>{isSelected ? "Selected pin" : "See pin details"}</span><span aria-hidden="true">{isSelected ? "✓" : "→"}</span></span>
            </button>;
          })}
        </div>

        <div className={`quick-result result-${assessment.status}`} role="status" aria-live="polite">
          <span className={`result-icon dot-${assessment.status}`} aria-hidden="true" />
          <div className="quick-result-copy"><strong>{selectedPin.label} · {assessment.title}</strong><p>{assessment.reason}</p>{assessment.note && <small>{assessment.note}</small>}</div>
          {isInputOnly && <span className="quick-result-chip">Input only</span>}
        </div>
        {purpose === "pullup" && assessment.status === "compatible" && <div className="wiring-hint" role="note" aria-label="Button wiring">
          <span className="eyebrow">BUTTON WIRING</span>
          <strong>Connect a button between {selectedPin.label} and GND.</strong>
          <p>Enable the internal pull-up in software. The pin reads HIGH at rest and LOW when pressed.</p>
        </div>}
      </section>

      <div className="browse-wrap">
        <button className="browse-toggle" type="button" aria-expanded={browseOpen} onClick={() => setBrowseOpen(open => !open)}>
          <span className="browse-icon" aria-hidden="true">{browseOpen ? "−" : "+"}</span>
          <span><strong>{browseOpen ? "Hide pin map" : "Browse all GPIO pins"}</strong><small>See {board.shortName} header order and pin capabilities</small></span>
          <span className="browse-chevron" aria-hidden="true">{browseOpen ? "⌃" : "⌄"}</span>
        </button>

        {browseOpen && <section className="workspace" aria-label="Full board pin map and selected pin details">
          <section className="map-panel" aria-labelledby="map-title">
            <div className="map-heading">
              <div><p className="eyebrow">{board.maker.toUpperCase()} PIN MAP</p><h2 id="map-title">Choose any pin</h2><p className="map-subtitle">Pins are checked for {purposeOption.label.toLowerCase()}.</p></div>
              <div className="legend" aria-label="Pin suitability legend"><span><i className="legend-dot dot-compatible" />Works</span><span><i className="legend-dot dot-caution" />Caution</span><span><i className="legend-dot dot-blocked" />Avoid</span></div>
            </div>

            <div className="pin-stage" style={{
              minHeight: `${rowCount * 22 + 86}px`
            }}>
              <PinRail side="left" pins={left} selectedGpio={selectedGpio} purpose={purpose} board={board} onSelect={setSelectedGpio} />
              <div className="board-column">
                <div className="board-label">{board.name}</div>
                {board.id === "doit-v1" ? <img className="board-image" src={boardAsset} alt="ESP32 DevKit V1 board" /> : <div className={`board-schematic schematic-${board.family}`} aria-label={`${board.name} schematic`}>
                    <span className="schematic-port" aria-hidden="true" />
                    <span className="schematic-maker">{board.maker}</span>
                    <span className="schematic-chip"><small>{board.family === "classic" ? "ESP32" : board.family.toUpperCase()}</small><strong>{board.module}</strong></span>
                    <span className="schematic-led" aria-hidden="true" />
                  </div>}
                <div className="module-label">{board.detail}</div>
              </div>
              <PinRail side="right" pins={right} selectedGpio={selectedGpio} purpose={purpose} board={board} onSelect={setSelectedGpio} />
            </div>
            <div className="board-footnote">{board.footerNote}</div>
          </section>

          <aside className="inspector" aria-label="Selected pin suitability">
            <div className="selected-heading">
              <span className="eyebrow">PIN DETAILS · {board.shortName.toUpperCase()}</span>
              <div className="selected-name-row"><h2>{selectedPin.label}</h2>{isInputOnly && <span className="type-chip">Input only</span>}</div>
              <div className="pin-badges">{badges.map(badge => <span className={`detail-chip ${badge === "Boot strapping" || badge === "Flash reserved" ? "chip-warning" : ""}`} key={badge}>{badge}</span>)}</div>
            </div>
            <div className={`result-card result-${assessment.status}`} role="status" aria-live="polite"><div className="result-title">{assessment.title}</div><p>{assessment.reason}</p></div>
            {assessment.note && <div className="boot-note">{assessment.note}</div>}
            <div className="reason-block"><h3>Capabilities</h3>
              <dl className="detail-list">
                <div><dt>Direction</dt><dd>{board.reserved.includes(selectedGpio) ? "Reserved" : isInputOnly ? "Input only" : "Input and output"}</dd></div>
                <div><dt>ADC channel</dt><dd>{adcChannel || "None"}</dd></div>
                <div><dt>Internal pull</dt><dd>{noPull ? "Not available" : "Pull-up and pull-down"}</dd></div>
                <div><dt>Boot strap</dt><dd>{board.straps.includes(selectedGpio) ? "Yes · check reset level" : "No"}</dd></div>
                <div><dt>Interrupt</dt><dd>{board.family === "classic" && (selectedGpio === 36 || selectedGpio === 39) ? "Supported · see limitation" : "Supported"}</dd></div>
              </dl>
            </div>
          </aside>
        </section>}
      </div>

      <footer className="app-footnote">Pinout references are a guide. Match the module and GPIO labels on your board before wiring.</footer>
    </main>
  </div>;
};
