"use client";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    FileText,
    File,
    Folder,
} from "lucide-react"
import { Fragment } from "react"

interface SearchDialogProps {
    isOpen: boolean
    setIsOpen: () => void
}

export function SearchDialog({ isOpen, setIsOpen }: SearchDialogProps) {

    const searchResults = [
        {
            type: "files",
            items: [
                { id: 1, name: "Document.pdf", icon: FileText },
                { id: 2, name: "Image.jpg", icon: File },
            ],
        },
        {
            type: "folders",
            items: [
                { id: 1, name: "Projects", icon: Folder },
                { id: 2, name: "Documents", icon: Folder },
            ],
        },
    ]

    return (
        <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
            <CommandInput placeholder="Type to search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {searchResults.map((group, i) => (
                    <Fragment key={'-' + i}>
                        <CommandGroup heading={group.type === "files" ? "Files" : "Folders"}>
                            {group.items.map((item) => (
                                <CommandItem key={item.id}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </Fragment>
                ))}
            </CommandList>
        </CommandDialog>
    )
}