import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import AIAssistant from "@/components/ai/AIAssistant";
import type { Stock } from "@shared/schema";

interface AIFabProps {
  selectedStock: Stock | null;
  portfolio: any;
}

export default function AIFab({ selectedStock, portfolio }: AIFabProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center ring-4 ring-purple-300/30 animate-[pulse_3s_ease-in-out_infinite] z-50"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-2xl overflow-hidden flex flex-col z-[100]"
      >
        <div className="max-w-5xl mx-auto h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-purple-600 flex-shrink-0 border-b">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">AI Trading Assistant</span>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <AIAssistant selectedStock={selectedStock} portfolio={portfolio} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
