"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isEditableElement } from "@/lib/copy-protection";

export function CopyProtection() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // Keep administrative workflows unaffected for test editing, exporting, and managing
    if (isAdmin) return;

    const handleCopy = (e: ClipboardEvent) => {
      if (isEditableElement(e.target)) return;
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.clearData();
        e.clipboardData.setData("text/plain", "");
      }
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selection.removeAllRanges();
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (isEditableElement(e.target)) return;
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.clearData();
        e.clipboardData.setData("text/plain", "");
      }
    };

    const handleSelectStart = (e: Event) => {
      if (isEditableElement(e.target)) return;
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      if (isEditableElement(e.target)) return;
      e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Allow context menu for form inputs so pasting/editing is supported
      if (isEditableElement(target)) return;
      // Allow context menu on links so standard browser navigation (open in new tab) is preserved
      if (target.closest("a")) return;
      // Prevent context menu on all other content (questions, explanations, options, images, text)
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableElement(e.target)) return;

      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      const key = e.key.toLowerCase();
      // Block Ctrl+C (Copy), Ctrl+X (Cut), Ctrl+A (Select All), Ctrl+P (Print to PDF/extract)
      if (key === "c" || key === "x" || key === "a" || key === "p") {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          selection.removeAllRanges();
        }
      }
    };

    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isAdmin]);

  return null;
}
