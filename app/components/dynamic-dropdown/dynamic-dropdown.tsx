import type { ChangeEvent } from "react";
import { cloneElement, useCallback, useMemo, useState } from "react";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import type { AllowedModelNames } from "~/routes/api+/model-filters";
import { tw } from "~/utils";
import { resetFetcher } from "~/utils/fetcher";
import Input from "../forms/input";
import { CheckIcon } from "../icons";
import { Badge, Button } from "../shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../shared/dropdown";
import type { Icon } from "../shared/icons-map";
import When from "../when/when";

type DropdownItem = { id: string; name: string; color?: string };

type Props = {
  className?: string;
  style?: React.CSSProperties;
  trigger: React.ReactElement;
  label?: React.ReactNode;
  searchIcon?: Icon;
  /** name of key in loader which is used to pass initial data */
  initialDataKey: string;
  /** name of key in loader which passing the total count */
  countKey: string;
  model: {
    /** name of the model for which the query has to run */
    name: AllowedModelNames;
    /** name of key for which we have to search the value */
    key: string;
  };
};

export default function DynamicDropdown({
  className,
  style,
  label = "Filter",
  trigger,
  searchIcon = "search",
  model,
  initialDataKey,
  countKey,
}: Props) {
  const initialData = useLoaderData();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const itemInParams = searchParams.getAll(model.name);
  const totalItems = initialData[countKey];
  const fetcher = useFetcher<Array<DropdownItem>>();

  const items = useMemo(() => {
    if (fetcher.data) {
      return fetcher.data;
    }

    return (initialData[initialDataKey] ?? []) as Array<DropdownItem>;
  }, [fetcher.data, initialData, initialDataKey]);

  const handleSelectItemChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      /** If item is already there in search params then remove it */
      if (itemInParams.includes(value)) {
        setSearchParams((prev) => {
          prev.delete(model.name, value);
          return prev;
        });
      } else {
        /** Otherwise, add the item in search params */
        setSearchParams((prev) => {
          prev.append(model.name, value);
          return prev;
        });
      }
    },
    [itemInParams, model.name, setSearchParams]
  );

  return (
    <div className="relative w-full">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className="inline-flex items-center gap-2 text-gray-500"
          asChild
        >
          <div>
            {cloneElement(trigger)}
            <When truthy={itemInParams.length > 0}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 px-2 py-[2px] text-xs font-medium text-gray-700">
                {itemInParams.length}
              </div>
            </When>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={tw(
            "max-h-[300px] w-[290px] overflow-y-auto md:w-[350px]",
            className
          )}
          style={style}
        >
          <div>
            <div className="mb-[6px] flex items-center justify-between">
              <div className="text-xs text-gray-500">{label}</div>
              <When truthy={itemInParams.length > 0}>
                <Button
                  as="button"
                  variant="link"
                  className="whitespace-nowrap text-xs font-normal text-gray-500 hover:text-gray-600"
                  onClick={() => {
                    setSearchParams((prev) => {
                      prev.delete(model.name);
                      return prev;
                    });
                  }}
                >
                  Clear filter
                </Button>
              </When>
            </div>
            <div className="filters-form relative">
              <Input
                type="text"
                label={`Search ${label?.toLocaleString()}`}
                placeholder={`Search ${label?.toLocaleString()}`}
                hideLabel
                className="mb-2 text-gray-500"
                icon={searchIcon}
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.currentTarget.value);
                  if (e.currentTarget.value) {
                    fetcher.submit(
                      {
                        model: model.name,
                        queryKey: model.key as string,
                        queryValue: e.currentTarget.value,
                      },
                      { method: "GET", action: "/api/model-filters" }
                    );
                  }
                }}
              />
              <When truthy={Boolean(searchQuery)}>
                <Button
                  icon="x"
                  variant="tertiary"
                  disabled={Boolean(searchQuery)}
                  onClick={() => {
                    resetFetcher(fetcher);
                    setSearchQuery("");
                  }}
                  className="z-100 pointer-events-auto absolute right-[14px] top-0 h-full border-0 p-0 text-center text-gray-400 hover:text-gray-900"
                />
              </When>
            </div>
            <div>
              {items.map((item) => (
                <label
                  key={item.id}
                  htmlFor={item.id}
                  className="relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm font-medium outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 "
                >
                  <Badge color={item.color ?? "red"} noBg>
                    {item.name}
                  </Badge>
                  <input
                    id={item.id}
                    type="checkbox"
                    value={item.id}
                    className="hidden"
                    checked={itemInParams.includes(item.id)}
                    onChange={handleSelectItemChange}
                  />
                  {itemInParams.includes(item.id) ? (
                    <span className="absolute right-2 flex  items-center justify-center text-primary">
                      <CheckIcon />
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
            <When truthy={totalItems > 4}>
              <div className="my-2 text-gray-500">
                Showing 4 out of {initialData[countKey]}, type to search for
                more
              </div>
            </When>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}