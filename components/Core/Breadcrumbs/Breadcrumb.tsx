import Link from "next/link";
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
      <h2 className="text-[16px] font-normal text-black dark:text-white">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/">
              Dashboard <span className="font-bold">/</span>
            </Link>
          </li>
          <li className="font-normal ">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
