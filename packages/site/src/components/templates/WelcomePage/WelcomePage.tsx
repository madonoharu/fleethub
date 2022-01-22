import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import {
  Button,
  Container,
  Divider,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { useDispatch } from "react-redux";

import { useModal } from "../../../hooks";
import { entitiesSlice, transferJorData, JorData } from "../../../store";
import { Flexbox } from "../../atoms";
import { ImportMenu } from "../../organisms";

const WelcomePage: React.FCX = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const ImprotMenuModal = useModal();

  const handleCreatePlan = () => {
    dispatch(entitiesSlice.actions.createPlan());
  };

  const handleTransfer = () => {
    window.addEventListener(
      "message",
      (ev) => {
        if (ev.origin === "https://kcjervis.github.io") {
          const data: JorData = ev.data;
          const payload = transferJorData(data);
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
          <Typography variant="h4">作戦室 v{process.env.VERSION}</Typography>
          <Alert severity="error" variant="outlined">
            デバッグ中です。告知なく破壊的変更、データ削除が実施される可能性があります。
            トラブル回避のために拡散は控えていただけると助かります。
          </Alert>

          <Typography mt={2}>
            作戦室は艦これの編成を支援するサイトです。弾着率、対地火力などの計算が行えます。
          </Typography>
        </div>
        <Flexbox gap={1}>
          <Button
            startIcon={<NoteAddIcon />}
            variant="contained"
            color="primary"
            onClick={handleCreatePlan}
          >
            {t("CreateComposition")}
          </Button>
          <Button
            startIcon={<SaveAltIcon />}
            variant="contained"
            color="primary"
            onClick={ImprotMenuModal.show}
          >
            {t("デッキビルダー形式などから編成を読み込む")}
          </Button>
          <Button
            startIcon={<SaveAltIcon />}
            variant="contained"
            color="primary"
            onClick={handleTransfer}
          >
            {t("Jervis ORからデータを引き継ぐ")}
          </Button>
        </Flexbox>

        <Typography variant="h5" mt={4}>
          Tips
        </Typography>
        <Divider />
        <Typography>
          デッキビルダー形式をURLに?predeck=...で埋め込めば編成を読み込めます。
        </Typography>

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
          詳しくはこちらをご覧ください。
        </Typography>

        <Typography variant="h5" mt={4}>
          知的財産権
        </Typography>
        <Divider />
        <Typography>
          当サイトで使用されている画像の知的財産権は、その権利者様に帰属します。権利者様からの削除依頼には速やかに対処いたします。
        </Typography>
      </Stack>

      <ImprotMenuModal>
        <ImportMenu onClose={ImprotMenuModal.hide} />
      </ImprotMenuModal>
    </Container>
  );
};

export default WelcomePage;
