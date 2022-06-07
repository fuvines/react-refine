/* eslint-disable react/display-name */
import React from "react";
import {
    IResourceComponentsProps,
    BaseRecord,
    CrudFilters,
    HttpError,
    useTranslate,
    useNavigation,
    useUpdate,
    useExport,
    getDefaultFilter,
} from "@pankod/refine-core";
import {
    useDataGrid,
    DataGrid,
    Grid,
    Box,
    TextField,
    Button,
    NumberField,
    Typography,
    DateField,
    GridColumns,
    GridActionsCellItem,
    Stack,
    useAutocomplete,
    Autocomplete,
    CardContent,
    Card,
    CardHeader,
    List,
    ExportButton,
} from "@pankod/refine-mui";
import { Controller, useForm } from "@pankod/refine-react-hook-form";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { OrderStatus, CustomTooltip } from "components";
import { IOrder, IOrderFilterVariables } from "interfaces";

export const OrderList: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();
    const { mutate } = useUpdate();

    const columns = React.useMemo<GridColumns<IOrder>>(
        () => [
            {
                field: "orderNumber",
                headerName: t("orders.fields.orderNumber"),
                description: t("orders.fields.orderNumber"),
                headerAlign: "center",
                align: "center",
                flex: 1,
                minWidth: 100,
            },
            {
                field: "status",
                headerName: t("orders.fields.status"),
                headerAlign: "center",
                align: "center",
                renderCell: ({ row }) => (
                    <OrderStatus status={row.status.text} />
                ),
                flex: 1,
                minWidth: 100,
            },
            {
                field: "amount",
                headerName: t("orders.fields.amount"),
                headerAlign: "center",
                align: "center",
                renderCell: ({ row }) => (
                    <NumberField
                        options={{
                            currency: "USD",
                            style: "currency",
                        }}
                        value={row.amount / 100}
                        sx={{ fontSize: "14px" }}
                    />
                ),
                flex: 1,
                minWidth: 100,
            },
            {
                field: "store",
                headerName: t("orders.fields.store"),
                valueGetter: ({ row }) => row.store.title,
                flex: 1,
                minWidth: 150,
            },
            {
                field: "user",
                headerName: t("orders.fields.user"),
                valueGetter: ({ row }) => row.user.fullName,
                flex: 1,
                minWidth: 150,
            },
            {
                field: "products",
                headerName: t("orders.fields.products"),
                headerAlign: "center",
                align: "center",
                renderCell: ({ row }) => (
                    <CustomTooltip
                        arrow
                        placement="top"
                        title={
                            <Stack sx={{ padding: "2px" }}>
                                {row.products.map((product) => (
                                    <li key={product.id}>{product.name}</li>
                                ))}
                            </Stack>
                        }
                    >
                        <Typography sx={{ fontSize: "14px" }}>
                            {t("orders.fields.itemsAmount", {
                                amount: row.products.length,
                            })}
                        </Typography>
                    </CustomTooltip>
                ),
                flex: 1,
                minWidth: 100,
            },
            {
                field: "createdAt",
                headerName: t("orders.fields.createdAt"),
                flex: 1,
                minWidth: 170,
                renderCell: ({ row }) => (
                    <DateField
                        value={row.createdAt}
                        format="LLL"
                        sx={{ fontSize: "14px" }}
                    />
                ),
            },
            {
                field: "actions",
                type: "actions",
                headerName: t("table.actions"),
                flex: 1,
                minWidth: 100,
                getActions: ({ id }) => [
                    <GridActionsCellItem
                        key={1}
                        icon={<CheckOutlinedIcon color="success" />}
                        sx={{ padding: "2px 6px" }}
                        label={t("buttons.accept")}
                        showInMenu
                        onClick={() => {
                            mutate({
                                resource: "orders",
                                id,
                                values: {
                                    status: {
                                        id: 2,
                                        text: "Ready",
                                    },
                                },
                            });
                        }}
                    />,
                    <GridActionsCellItem
                        key={2}
                        icon={<CloseOutlinedIcon color="error" />}
                        sx={{ padding: "2px 6px" }}
                        label={t("buttons.reject")}
                        showInMenu
                        onClick={() =>
                            mutate({
                                resource: "orders",
                                id,
                                values: {
                                    status: {
                                        id: 5,
                                        text: "Cancelled",
                                    },
                                },
                            })
                        }
                    />,
                ],
            },
        ],
        [],
    );

    const { dataGridProps, search, filters, sorter } = useDataGrid<
        IOrder,
        HttpError,
        IOrderFilterVariables
    >({
        columns,
        initialPageSize: 10,
        onSearch: (params) => {
            const filters: CrudFilters = [];
            const { q, store, user, status } = params;

            filters.push({
                field: "q",
                operator: "eq",
                value: q !== "" ? q : undefined,
            });

            filters.push({
                field: "store.id",
                operator: "eq",
                value: (store ?? [].length) > 0 ? store : undefined,
            });

            filters.push({
                field: "user.id",
                operator: "eq",
                value: user,
            });

            filters.push({
                field: "status.text",
                operator: "in",
                value: (status ?? []).length > 0 ? status : undefined,
            });

            return filters;
        },
    });

    const { show } = useNavigation();

    const { isLoading, triggerExport } = useExport<IOrder>({
        sorter,
        filters,
        pageSize: 50,
        maxItemCount: 50,
        mapData: (item) => {
            return {
                id: item.id,
                amount: item.amount,
                orderNumber: item.orderNumber,
                status: item.status.text,
                store: item.store.title,
                user: item.user.firstName,
            };
        },
    });

    const { register, handleSubmit, control } = useForm<
        BaseRecord,
        HttpError,
        IOrderFilterVariables
    >({
        defaultValues: {
            status: getDefaultFilter("status.text", filters, "in"),
            q: getDefaultFilter("q", filters, "eq"),
            store: getDefaultFilter("store.id", filters, "eq"),
            user: getDefaultFilter("user.id", filters, "eq"),
        },
    });

    const { autocompleteProps: storeAutocompleteProps } = useAutocomplete({
        resource: "stores",
        defaultValue: getDefaultFilter("store.id", filters, "eq"),
    });

    const { autocompleteProps: orderAutocompleteProps } = useAutocomplete({
        resource: "orderStatuses",
    });

    const { autocompleteProps: userAutocompleteProps } = useAutocomplete({
        resource: "users",
        optionLabel: "fullName",
        defaultValue: getDefaultFilter("user.id", filters, "eq"),
    });

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} lg={3}>
                <Card sx={{ paddingX: { xs: 2, md: 0 } }}>
                    <CardHeader title="Filters" />
                    <CardContent sx={{ pt: 0 }}>
                        <Box
                            component="form"
                            sx={{ display: "flex", flexDirection: "column" }}
                            autoComplete="off"
                            onSubmit={handleSubmit(search)}
                        >
                            <TextField
                                {...register("q")}
                                label={t("orders.filter.search.label")}
                                placeholder={t(
                                    "orders.filter.search.placeholder",
                                )}
                                margin="normal"
                                fullWidth
                                autoFocus
                                size="small"
                            />
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <Autocomplete
                                        {...orderAutocompleteProps}
                                        {...field}
                                        multiple
                                        onChange={(_, value) => {
                                            field.onChange(
                                                value.map((p) => p.text ?? p),
                                            );
                                        }}
                                        getOptionLabel={(item) => {
                                            return item?.text
                                                ? item.text
                                                : item;
                                        }}
                                        isOptionEqualToValue={(
                                            option,
                                            value,
                                        ) => {
                                            return (
                                                value === undefined ||
                                                option.text === value
                                            );
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t(
                                                    "orders.filter.status.label",
                                                )}
                                                placeholder={t(
                                                    "orders.filter.status.placeholder",
                                                )}
                                                margin="normal"
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="store"
                                render={({ field }) => (
                                    <Autocomplete
                                        {...storeAutocompleteProps}
                                        {...field}
                                        onChange={(_, value) => {
                                            field.onChange(value?.id ?? value);
                                        }}
                                        getOptionLabel={(item) => {
                                            return item.title
                                                ? item.title
                                                : storeAutocompleteProps?.options?.find(
                                                      (p) =>
                                                          p.id.toString() ===
                                                          item.toString(),
                                                  )?.title ?? "";
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                            value === undefined ||
                                            option.id.toString() ===
                                                value.toString()
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t(
                                                    "orders.filter.store.label",
                                                )}
                                                placeholder={t(
                                                    "orders.filter.store.placeholder",
                                                )}
                                                margin="normal"
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="user"
                                render={({ field }) => (
                                    <Autocomplete
                                        {...userAutocompleteProps}
                                        {...field}
                                        onChange={(_, value) => {
                                            field.onChange(value?.id ?? value);
                                        }}
                                        getOptionLabel={(item) => {
                                            return item.fullName
                                                ? item.fullName
                                                : userAutocompleteProps?.options?.find(
                                                      (p) =>
                                                          p.id.toString() ===
                                                          item.toString(),
                                                  )?.fullName ?? "";
                                        }}
                                        isOptionEqualToValue={(
                                            option,
                                            value,
                                        ) => {
                                            return (
                                                value === undefined ||
                                                option.id === value
                                            );
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t(
                                                    "orders.filter.user.label",
                                                )}
                                                placeholder={t(
                                                    "orders.filter.user.placeholder",
                                                )}
                                                margin="normal"
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    />
                                )}
                            />
                            <br />
                            <Button type="submit" variant="contained">
                                {t("orders.filter.submit")}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} lg={9}>
                <List
                    cardProps={{ sx: { paddingX: { xs: 2, md: 0 } } }}
                    cardHeaderProps={{
                        action: (
                            <ExportButton
                                onClick={triggerExport}
                                loading={isLoading}
                            />
                        ),
                    }}
                >
                    <DataGrid
                        {...dataGridProps}
                        filterModel={undefined}
                        autoHeight
                        onRowClick={({ id }) => {
                            show("orders", id);
                        }}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        sx={{
                            ...dataGridProps.sx,
                            "& .MuiDataGrid-row": {
                                cursor: "pointer",
                            },
                        }}
                    />
                </List>
            </Grid>
        </Grid>
    );
};