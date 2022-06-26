import CableIcon from "@mui/icons-material/Cable";
import MailIcon from "@mui/icons-material/Mail";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import TwitterIcon from "@mui/icons-material/Twitter";
import {
  Button,
  Container,
  Divider,
  Typography,
  Stack,
  Link,
  css,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAppDispatch, useModal } from "../../../hooks";
import { entitiesSlice, migrateFromJor, JorData } from "../../../store";
import { ImportMenu } from "../../organisms";

const WelcomePage: React.FCX = () => {
  const { t, i18n } = useTranslation("common");
  const dispatch = useAppDispatch();
  const ImportMenuModal = useModal();

  const handleCreatePlan = () => {
    dispatch(entitiesSlice.actions.createPlan());
  };

  const handleMigrate = () => {
    window.addEventListener(
      "message",
      (ev) => {
        if (ev.origin === "https://kcjervis.github.io") {
          const data = ev.data as JorData;
          const payload = migrateFromJor(data);
          dispatch(entitiesSlice.actions.import(payload));
        }
      },
      {
        once: true,
      }
    );

    window.open("https://kcjervis.github.io/jervis/#/transfer");
  };

  return (
    <Container maxWidth="md" sx={{ pt: 5 }}>
      <Stack gap={1}>
        <div>
          <Stack direction="row" alignItems="flex-end" gap={1}>
            <Typography variant="h4">
              {t("meta.title")} v{process.env.VERSION}
            </Typography>
            <Link href="https://github.com/madonoharu/fleethub/releases">
              {t("Changelog")}
            </Link>
          </Stack>
          <Typography mt={2}>{t("meta.description")}</Typography>
        </div>
        <Stack
          gap={1}
          mr="auto"
          css={css`
            > button {
              justify-content: flex-start;
            }
          `}
          color="primary"
        >
          <Button
            startIcon={<NoteAddIcon />}
            variant="contained"
            color="primary"
            onClick={handleCreatePlan}
          >
            {t("CreateComp")}
          </Button>
          <Button
            startIcon={<SaveAltIcon />}
            variant="contained"
            color="primary"
            onClick={ImportMenuModal.show}
          >
            {t("ImportComps")}
          </Button>
          <Button
            startIcon={<CableIcon />}
            variant="contained"
            color="primary"
            onClick={handleMigrate}
          >
            {t("MigrateFromJor")}
          </Button>
        </Stack>
        <Typography variant="h5" mt={4}>
          Tips
        </Typography>
        <Divider />
        <p>
          デッキビルダー形式をURLに?predeck=...で埋め込めば編成を読み込めます。
        </p>

        {i18n.language !== "ja" && (
          <p>
            About Localization -{" "}
            <Link href="https://github.com/madonoharu/fleethub/tree/develop/packages/site/public/locales">
              {t("AboutLocalization")}
            </Link>
          </p>
        )}

        <Typography variant="h5" mt={4}>
          Author
        </Typography>
        <Divider />
        <Typography>まどの</Typography>
        <Link
          display="flex"
          alignItems="center"
          gap={1}
          color="inherit"
          href="https://twitter.com/madonoharu"
        >
          <TwitterIcon color="primary" />
          @madonoharu
        </Link>
        <Link
          display="flex"
          alignItems="center"
          gap={1}
          color="inherit"
          href="https://marshmallow-qa.com/madonoharu"
        >
          <QuestionAnswerIcon color="secondary" />
          マシュマロ(匿名でメッセージを送る)
        </Link>
        <Typography display="flex" alignItems="center" gap={1}>
          <MailIcon />
          madonoharu@gmail.com
        </Typography>

        <Typography variant="h5" mt={4}>
          Maintainers
        </Typography>
        <Divider />
        <Typography>
          白(
          <Link href="https://twitter.com/shiro_sh39">@shiro_sh39</Link>)
        </Typography>
        <Typography>
          ダイコン(
          <Link href="https://twitter.com/panmodoki10">@panmodoki10</Link>)
        </Typography>
        <Typography>ゆーる</Typography>

        <Typography variant="h5" mt={4}>
          免責事項
        </Typography>
        <Divider />
        <Typography>
          当サイトに表示される情報は仮説式等を多く使用しているため、その正確性については保障しません。また、当サイトの計算結果によって発生した損害について一切の責任を負いません。
        </Typography>

        <Typography variant="h5" mt={4}>
          プライバシーポリシー
        </Typography>
        <Divider />
        <Typography>
          当サイトでは、Googleの提供するアクセス解析サービス「Google
          Analytics」を使用しています。これにはデータ収集のためにCookieを使用しておりますが、このデータは匿名で収集されており、個人を特定するものではありません。
          詳しくは
          <Link href="https://policies.google.com/technologies/partner-sites">
            こちら
          </Link>
          をご覧ください。
        </Typography>

        <Typography variant="h5" mt={4}>
          知的財産権
        </Typography>
        <Divider />
        <Typography>
          当サイトで使用されている画像の知的財産権は、その権利者様に帰属します。権利者様からの削除依頼には速やかに対処いたします。
        </Typography>
      </Stack>

      <ImportMenuModal>
        <ImportMenu onClose={ImportMenuModal.hide} />
      </ImportMenuModal>
    </Container>
  );
};

export default WelcomePage;
