import { ReactNode } from "react";
import clsx from "clsx";

type EnterpriseCardProps = {
  children: ReactNode;
  className?: string;
};

export function EnterpriseCard({ children, className }: EnterpriseCardProps) {
  return (
    <section
      className={clsx(
        "rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      {children}
    </section>
  );
}
