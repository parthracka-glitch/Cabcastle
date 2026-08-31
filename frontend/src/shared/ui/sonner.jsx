import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          background: "#FFFFFF",
          color: "#111111",
          border: "1px solid #E8E2D9",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
          borderRadius: "1rem",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#111111] group-[.toaster]:border-[#E8E2D9] group-[.toaster]:shadow-xl font-body font-semibold text-xs rounded-2xl",
          description: "group-[.toast]:text-[#706B65]",
          actionButton:
            "group-[.toast]:bg-[#111111] group-[.toast]:text-white rounded-full font-bold",
          cancelButton:
            "group-[.toast]:bg-[#F4EFEA] group-[.toast]:text-[#111111] rounded-full font-bold",
          closeButton:
            "group-[.toast]:bg-[#FAF7F2] group-[.toast]:text-[#111111] group-[.toast]:border-[#E8E2D9]",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
