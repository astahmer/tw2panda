import { cac } from "cac";
import { twToPanda } from "./converter/tw-to-panda";

const cli = cac();

cli.option(
  "--classList <classList>",
  "Enter a tailwind classList to convert from",
  {
    default:
      "md:flex bg-slate-100 rounded-xl p-8 md:p-0 dark:bg-slate-800 text-sky-500 dark:text-sky-400",
  }
);

const parsed = cli.parse();
const classListString = parsed.options.classList as string;
console.log(twToPanda(classListString));
